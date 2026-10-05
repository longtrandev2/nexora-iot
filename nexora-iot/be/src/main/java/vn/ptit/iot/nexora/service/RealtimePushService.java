package vn.ptit.iot.nexora.service;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import vn.ptit.iot.nexora.dto.SensorDtos.SensorReadingDto;

/** STOMP pushes for the FE `onSensorData` / `onDeviceStatus` subscriptions. Never throws. */
@Service
public class RealtimePushService {

    public static final String SENSORS_TOPIC = "/topic/sensors";
    public static final String DEVICES_TOPIC = "/topic/devices";
    private static final Logger log = LoggerFactory.getLogger(RealtimePushService.class);

    private final SimpMessagingTemplate template;
    private final DeviceQueryService deviceQueryService;

    public RealtimePushService(SimpMessagingTemplate template, DeviceQueryService deviceQueryService) {
        this.template = template;
        this.deviceQueryService = deviceQueryService;
    }

    /** Full device snapshot (FE merges last-write-wins per id). */
    public void pushDevices() {
        try {
            template.convertAndSend(DEVICES_TOPIC, deviceQueryService.devices());
        } catch (RuntimeException e) {
            log.warn("Push {} failed: {}", DEVICES_TOPIC, e.getMessage());
        }
    }

    public void pushSensorReadings(List<SensorReadingDto> readings) {
        try {
            template.convertAndSend(SENSORS_TOPIC, readings);
        } catch (RuntimeException e) {
            log.warn("Push {} failed: {}", SENSORS_TOPIC, e.getMessage());
        }
    }
}
