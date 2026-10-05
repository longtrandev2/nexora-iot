package vn.ptit.iot.nexora.service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import vn.ptit.iot.nexora.config.MqttProperties;
import vn.ptit.iot.nexora.dto.DeviceDtos.ControlRequest;
import vn.ptit.iot.nexora.dto.DeviceDtos.ControlResult;
import vn.ptit.iot.nexora.entity.Device;
import vn.ptit.iot.nexora.entity.DeviceStatus;
import vn.ptit.iot.nexora.entity.ToggleAction;
import vn.ptit.iot.nexora.mqtt.MqttPayloadParser;
import vn.ptit.iot.nexora.mqtt.MqttPublisher;
import vn.ptit.iot.nexora.mqtt.MqttPublisher.MqttUnavailableException;
import vn.ptit.iot.nexora.repository.DeviceRepository;
import vn.ptit.iot.nexora.service.DeviceCommandRecorder.CommandTicket;

/**
 * API-09 closed loop (UC03): validate -> E3 in-flight check -> rows/devices 'loading' + push ->
 * publish device_control -> wait for device_response (<= 30s) -> success/failed + push.
 * Timeout (E1) -> rows failed, devices reverted, HTTP 504 "Thiết bị không phản hồi".
 * The request thread blocks while waiting (single-user demo, documented trade-off).
 */
@Service
public class DeviceControlService {

    private static final Logger log = LoggerFactory.getLogger(DeviceControlService.class);

    private final DeviceRepository deviceRepository;
    private final PendingCommandRegistry registry;
    private final DeviceCommandRecorder recorder;
    private final RealtimePushService push;
    private final MqttPublisher mqtt;
    private final String controlTopic;
    private final long timeoutMs;

    public DeviceControlService(DeviceRepository deviceRepository, PendingCommandRegistry registry,
                                DeviceCommandRecorder recorder, RealtimePushService push, MqttPublisher mqtt,
                                MqttProperties mqttProperties,
                                @Value("${device.control-timeout-ms:30000}") long timeoutMs) {
        this.deviceRepository = deviceRepository;
        this.registry = registry;
        this.recorder = recorder;
        this.push = push;
        this.mqtt = mqtt;
        this.controlTopic = mqttProperties.topics().deviceControl();
        this.timeoutMs = timeoutMs;
    }

    public List<ControlResult> control(int userId, ControlRequest request) {
        if (request == null) throw ApiException.badRequest("Dữ liệu gửi lên không hợp lệ");
        boolean all = request.all() != null;
        ToggleAction action = all ? request.all() : request.action();
        if (action == null) throw ApiException.badRequest("Thiếu hành động bật/tắt (on/off)");
        List<Integer> ids = targetIds(all, request.deviceId());

        Map<Integer, CompletableFuture<DeviceStatus>> futures = registry.tryRegister(ids, action.targetStatus())
                .orElseThrow(() -> ApiException.badRequest("Thiết bị đang có lệnh đang xử lý"));
        List<CommandTicket> tickets;
        try {
            tickets = recorder.begin(ids, action, userId);
        } catch (RuntimeException e) {
            registry.release(futures);
            throw e;
        }
        push.pushDevices();
        return awaitConfirmation(tickets, futures, all ? null : ids.get(0), action);
    }

    private List<ControlResult> awaitConfirmation(List<CommandTicket> tickets,
                                                  Map<Integer, CompletableFuture<DeviceStatus>> futures,
                                                  Integer singleDeviceId, ToggleAction action) {
        try {
            mqtt.publish(controlTopic, MqttPayloadParser.controlPayload(singleDeviceId, action));
            CompletableFuture.allOf(futures.values().toArray(CompletableFuture[]::new))
                    .get(timeoutMs, TimeUnit.MILLISECONDS);
        } catch (TimeoutException e) {
            log.warn("No device_response within {}ms for devices {}", timeoutMs, futures.keySet());
            throw failed(tickets, futures, HttpStatus.GATEWAY_TIMEOUT, "Thiết bị không phản hồi");
        } catch (MqttUnavailableException e) {
            log.warn("Control aborted: {}", e.getMessage());
            throw failed(tickets, futures, HttpStatus.SERVICE_UNAVAILABLE, "Không kết nối được MQTT broker");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw failed(tickets, futures, HttpStatus.SERVICE_UNAVAILABLE, "Lệnh điều khiển bị hủy");
        } catch (ExecutionException | RuntimeException e) {
            log.error("Control failed unexpectedly for devices {}", futures.keySet(), e);
            throw failed(tickets, futures, HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi máy chủ, vui lòng thử lại");
        }
        Map<Integer, DeviceStatus> reported = futures.entrySet().stream()
                .collect(Collectors.toMap(Map.Entry::getKey, e -> e.getValue().join()));
        List<Device> confirmed;
        try {
            confirmed = recorder.complete(tickets, reported, action);
        } catch (RuntimeException e) {
            log.error("Persisting confirmed command failed, reverting devices", e);
            revertQuietly(tickets);
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi máy chủ, vui lòng thử lại");
        } finally {
            // Keep E3 closed until the outcome is committed, so a new command never sees 'loading'
            // as its previous status.
            registry.release(futures);
        }
        push.pushDevices();
        return confirmed.stream().map(ControlResult::from).toList();
    }

    /**
     * Failure path. Order matters: revert first, then release the waits, then replay any echo
     * that arrived in between (it was captured by a wait nobody reads any more).
     */
    private ApiException failed(List<CommandTicket> tickets, Map<Integer, CompletableFuture<DeviceStatus>> futures,
                                HttpStatus status, String message) {
        revertQuietly(tickets);
        registry.release(futures);
        try {
            futures.forEach((id, future) -> {
                DeviceStatus late = future.getNow(null);
                if (late != null) recorder.syncReported(id, late);
            });
        } catch (RuntimeException e) {
            log.error("Could not replay late device_response for {}", futures.keySet(), e);
        }
        push.pushDevices();
        return new ApiException(status, message);
    }

    /** Best effort: a DB outage here must not hide the original error from the caller. */
    private void revertQuietly(List<CommandTicket> tickets) {
        try {
            recorder.fail(tickets);
        } catch (RuntimeException e) {
            log.error("Could not revert devices {} (left 'loading' until restart)", tickets, e);
        }
    }

    private List<Integer> targetIds(boolean all, Integer deviceId) {
        if (all) return deviceRepository.findAllByOrderByIdAsc().stream().map(Device::getId).toList();
        if (deviceId == null) throw ApiException.badRequest("Thiếu thiết bị cần điều khiển");
        if (!deviceRepository.existsById(deviceId)) throw ApiException.notFound("Không tìm thấy thiết bị");
        return List.of(deviceId);
    }

    /** Recover devices left in 'loading' by a crash mid-command (rows keep their history). */
    @EventListener(ApplicationReadyEvent.class)
    public void recoverStaleLoading() {
        int reset = recorder.resetStaleLoading();
        if (reset > 0) log.warn("Reset {} device(s) stuck in 'loading' to 'off'", reset);
    }
}
