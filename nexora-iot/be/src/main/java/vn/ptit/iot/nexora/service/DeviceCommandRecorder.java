package vn.ptit.iot.nexora.service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.ptit.iot.nexora.entity.ActionStatus;
import vn.ptit.iot.nexora.entity.Device;
import vn.ptit.iot.nexora.entity.DeviceAction;
import vn.ptit.iot.nexora.entity.DeviceStatus;
import vn.ptit.iot.nexora.entity.ToggleAction;
import vn.ptit.iot.nexora.repository.DeviceActionRepository;
import vn.ptit.iot.nexora.repository.DeviceRepository;

/**
 * Persistence side of the control loop (one transaction per transition):
 * begin (rows loading, devices loading) -> complete (success/failed, reported state)
 * or fail (rows failed, devices reverted).
 */
@Service
public class DeviceCommandRecorder {

    /** One device's share of a command: its action row + the status to revert to. */
    public record CommandTicket(int deviceId, int actionId, DeviceStatus previousStatus) {
    }

    private final DeviceRepository deviceRepository;
    private final DeviceActionRepository actionRepository;

    public DeviceCommandRecorder(DeviceRepository deviceRepository, DeviceActionRepository actionRepository) {
        this.deviceRepository = deviceRepository;
        this.actionRepository = actionRepository;
    }

    @Transactional
    public List<CommandTicket> begin(List<Integer> deviceIds, ToggleAction action, int userId) {
        LocalDateTime now = now();
        List<CommandTicket> tickets = new ArrayList<>();
        for (Integer id : deviceIds) {
            Device device = deviceRepository.findById(id).orElseThrow();
            DeviceAction row = actionRepository.save(new DeviceAction(id, userId, action, ActionStatus.loading, now));
            tickets.add(new CommandTicket(id, row.getId(), device.getStatus()));
            device.changeStatus(DeviceStatus.loading, now);
        }
        return tickets;
    }

    /** Hardware answered: row success iff the reported state equals the requested one. */
    @Transactional
    public List<Device> complete(List<CommandTicket> tickets, Map<Integer, DeviceStatus> reported,
                                 ToggleAction action) {
        LocalDateTime now = now();
        List<Device> devices = new ArrayList<>();
        for (CommandTicket t : tickets) {
            DeviceStatus actual = reported.get(t.deviceId());
            DeviceAction row = actionRepository.findById(t.actionId()).orElseThrow();
            row.setStatus(actual == action.targetStatus() ? ActionStatus.success : ActionStatus.failed);
            Device device = deviceRepository.findById(t.deviceId()).orElseThrow();
            device.changeStatus(actual, now);
            devices.add(device);
        }
        return devices;
    }

    /** E1 timeout / broker down: rows failed, devices back to their pre-command state. */
    @Transactional
    public void fail(List<CommandTicket> tickets) {
        LocalDateTime now = now();
        for (CommandTicket t : tickets) {
            actionRepository.findById(t.actionId()).ifPresent(row -> row.setStatus(ActionStatus.failed));
            deviceRepository.findById(t.deviceId()).ifPresent(d -> d.changeStatus(t.previousStatus(), now));
        }
    }

    /** device_response with no command waiting (e.g. after a timeout): sync state, no rows. */
    @Transactional
    public boolean syncReported(int deviceId, DeviceStatus reported) {
        return deviceRepository.findById(deviceId)
                .filter(d -> d.getStatus() != reported)
                .map(d -> {
                    d.changeStatus(reported, now());
                    return true;
                })
                .orElse(false);
    }

    /**
     * After a crash mid-command a device may be stuck in 'loading' — fall back to 'off'. The "{}"
     * resync published on every MQTT connect then corrects it to the real hardware state.
     */
    @Transactional
    public int resetStaleLoading() {
        List<Device> stuck = deviceRepository.findByStatus(DeviceStatus.loading);
        LocalDateTime now = now();
        stuck.forEach(d -> d.changeStatus(DeviceStatus.off, now));
        return stuck.size();
    }

    private static LocalDateTime now() {
        return LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS);
    }
}
