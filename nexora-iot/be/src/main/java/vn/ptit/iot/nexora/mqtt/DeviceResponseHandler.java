package vn.ptit.iot.nexora.mqtt;

import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import vn.ptit.iot.nexora.entity.DeviceStatus;
import vn.ptit.iot.nexora.service.DeviceCommandRecorder;
import vn.ptit.iot.nexora.service.PendingCommandRegistry;
import vn.ptit.iot.nexora.service.RealtimePushService;

/**
 * device_response ({led1:on,led2:off,led3:on} — always the full hardware state).
 * Devices with a command in flight are offered to their wait (DeviceControlService persists);
 * the others are a plain state sync (DB updated only if different, then pushed).
 */
@Component
public class DeviceResponseHandler {

    private static final Logger log = LoggerFactory.getLogger(DeviceResponseHandler.class);

    private final PendingCommandRegistry registry;
    private final DeviceCommandRecorder recorder;
    private final RealtimePushService push;

    public DeviceResponseHandler(PendingCommandRegistry registry, DeviceCommandRecorder recorder,
                                 RealtimePushService push) {
        this.registry = registry;
        this.recorder = recorder;
        this.push = push;
    }

    public void handle(String payload) {
        Map<Integer, DeviceStatus> states = MqttPayloadParser.parseLedStates(payload);
        if (states.isEmpty()) {
            log.warn("Ignoring unparseable device_response '{}'", payload);
            return;
        }
        boolean synced = false;
        for (Map.Entry<Integer, DeviceStatus> e : states.entrySet()) {
            if (!registry.offer(e.getKey(), e.getValue())) {
                synced |= recorder.syncReported(e.getKey(), e.getValue());
            }
        }
        if (synced) push.pushDevices();
    }
}
