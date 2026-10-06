package vn.ptit.iot.nexora.service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import vn.ptit.iot.nexora.dto.ApiDto;
import vn.ptit.iot.nexora.dto.ApiDto.ControlRequest;
import vn.ptit.iot.nexora.dto.ApiDto.ControlResult;
import vn.ptit.iot.nexora.dto.ApiDto.DeviceActionDto;
import vn.ptit.iot.nexora.dto.ApiDto.DeviceDto;
import vn.ptit.iot.nexora.dto.ApiDto.Paged;
import vn.ptit.iot.nexora.entity.Device;
import vn.ptit.iot.nexora.entity.DeviceAction;
import vn.ptit.iot.nexora.entity.User;
import vn.ptit.iot.nexora.mqtt.MqttPayloadParser;
import vn.ptit.iot.nexora.mqtt.MqttService;
import vn.ptit.iot.nexora.repository.DeviceActionRepository;
import vn.ptit.iot.nexora.repository.DeviceRepository;
import vn.ptit.iot.nexora.repository.UserRepository;

/** LED list, on/off history and the control loop with the ESP32. */
@Service
@RequiredArgsConstructor
public class DeviceService {

    private static final long CONFIRM_TIMEOUT_SECONDS = 30;

    private final DeviceRepository devices;
    private final DeviceActionRepository actions;
    private final UserRepository users;
    private final MqttService mqtt;
    private final SimpMessagingTemplate ws;

    /** LED id -> command waiting for the ESP32 to report `target`. At most one per LED. */
    private final Map<Integer, Pending> pending = new ConcurrentHashMap<>();

    private record Pending(Device.Status target, CompletableFuture<Void> confirmed) {
    }

    public List<DeviceDto> devices() {
        return devices.findAllByOrderByIdAsc().stream().map(DeviceDto::from).toList();
    }

    public Paged<DeviceActionDto> history(Integer deviceId, DeviceAction.Command action, DeviceAction.Result status,
                                          LocalDateTime from, LocalDateTime to, String search,
                                          Integer page, Integer limit) {
        Map<Integer, String> ledNames = devices.findAll().stream().collect(Collectors.toMap(Device::getId, Device::getName));
        Map<Integer, String> userNames = users.findAll().stream().collect(Collectors.toMap(User::getId, User::getFullname));
        return Paged.of(actions.search(deviceId, action, status, from, to, SensorService.needle(search),
                        ApiDto.pageable(page, limit)),
                a -> new DeviceActionDto(a.getId(), a.getDeviceId(), ledNames.get(a.getDeviceId()), a.getAction(),
                        a.getStatus(), a.getUserId(), userNames.get(a.getUserId()), a.getTime()));
    }

    /**
     * Sends the command and waits until the ESP32 confirms it (device_response) — max 30s.
     * loading -> success (LED = target) | failed (LED back to its old state, HTTP 504).
     */
    public List<ControlResult> control(int userId, ControlRequest req) {
        boolean all = req.all() != null;
        DeviceAction.Command cmd = all ? req.all() : req.action();
        if (cmd == null) throw ApiException.badRequest("Thiếu hành động bật/tắt");
        List<Device> targets = all ? devices.findAllByOrderByIdAsc() : List.of(findDevice(req.deviceId()));
        Device.Status target = Device.Status.valueOf(cmd.name());
        List<CompletableFuture<Void>> waits = register(targets, target);

        Map<Integer, Device.Status> previous = new HashMap<>();
        List<DeviceAction> rows = new ArrayList<>();
        try {
            for (Device d : targets) {
                previous.put(d.getId(), d.getStatus());
                rows.add(new DeviceAction(d.getId(), userId, cmd, now()));
            }
            finish(rows, targets, DeviceAction.Result.loading, d -> Device.Status.loading);
            String key = all ? "all" : "led" + targets.get(0).getId();
            mqtt.publish(MqttService.DEVICE_CONTROL, "{" + key + ":" + cmd + "}");   // e.g. {led2:on}, {all:off}
            CompletableFuture.allOf(waits.toArray(CompletableFuture[]::new)).get(CONFIRM_TIMEOUT_SECONDS, TimeUnit.SECONDS);
            finish(rows, targets, DeviceAction.Result.success, d -> target);
            return targets.stream().map(ControlResult::from).toList();
        } catch (Exception e) {
            finish(rows, targets, DeviceAction.Result.failed, d -> previous.get(d.getId()));
            if (e instanceof InterruptedException) Thread.currentThread().interrupt();
            throw e instanceof ApiException api ? api
                    : new ApiException(HttpStatus.GATEWAY_TIMEOUT, "Thiết bị không phản hồi");
        } finally {
            targets.forEach(d -> pending.remove(d.getId()));
        }
    }

    /**
     * device_response always holds all 3 LEDs, e.g. {led1:on,led2:off,led3:on}. A LED with a command
     * waiting completes it only when the state equals the target (an echo of an earlier command is
     * ignored); other LEDs are just synced into the DB.
     */
    @EventListener(condition = "#msg.topic() == T(vn.ptit.iot.nexora.mqtt.MqttService).DEVICE_RESPONSE")
    public void onDeviceResponse(MqttService.Message msg) {
        boolean changed = false;
        for (Map.Entry<Integer, Device.Status> led : MqttPayloadParser.parseLeds(msg.payload()).entrySet()) {
            Pending p = pending.get(led.getKey());
            if (p != null) {
                if (p.target() == led.getValue()) p.confirmed().complete(null);
                continue;
            }
            Device d = devices.findById(led.getKey()).orElse(null);
            if (d != null && d.getStatus() != led.getValue()) {
                d.setStatus(led.getValue());
                d.setUpdatedAt(now());
                devices.save(d);
                changed = true;
            }
        }
        if (changed) pushDevices();
    }

    /** A crash during a command could leave a LED "loading" forever. */
    @EventListener(ApplicationReadyEvent.class)
    public void resetLoadingLeds() {
        devices.findAll().stream().filter(d -> d.getStatus() == Device.Status.loading).forEach(d -> {
            d.setStatus(Device.Status.off);
            devices.save(d);
        });
    }

    /** E3: refuse a command on a LED that is still waiting for the ESP32. */
    private synchronized List<CompletableFuture<Void>> register(List<Device> targets, Device.Status target) {
        if (targets.stream().anyMatch(d -> pending.containsKey(d.getId()))) {
            throw ApiException.badRequest("Thiết bị đang có lệnh đang xử lý");
        }
        List<CompletableFuture<Void>> waits = new ArrayList<>();
        for (Device d : targets) {
            Pending p = new Pending(target, new CompletableFuture<>());
            pending.put(d.getId(), p);
            waits.add(p.confirmed());
        }
        return waits;
    }

    /** Sets the action rows + LED states, saves them and pushes the LEDs to the FE. */
    private void finish(List<DeviceAction> rows, List<Device> leds, DeviceAction.Result result,
                        Function<Device, Device.Status> newStatus) {
        rows.forEach(r -> r.setStatus(result));
        actions.saveAll(rows);
        for (Device d : leds) {
            d.setStatus(newStatus.apply(d));
            d.setUpdatedAt(now());
        }
        devices.saveAll(leds);
        pushDevices();
    }

    private Device findDevice(Integer id) {
        if (id == null) throw ApiException.badRequest("Thiếu thiết bị cần điều khiển");
        return devices.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy thiết bị"));
    }

    private void pushDevices() {
        ws.convertAndSend("/topic/devices", devices());
    }

    private static LocalDateTime now() {
        return LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS);
    }
}
