package vn.ptit.iot.nexora.mqtt;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import vn.ptit.iot.nexora.dto.SensorDtos.SensorReadingDto;
import vn.ptit.iot.nexora.mqtt.MqttPayloadParser.SensorTick;
import vn.ptit.iot.nexora.service.RealtimePushService;
import vn.ptit.iot.nexora.service.SensorIngestService;

/** sensor_data tick (every 2s) -> 3 rows in data_sensors -> push /topic/sensors. */
@Component
public class SensorDataHandler {

    private static final Logger log = LoggerFactory.getLogger(SensorDataHandler.class);

    private final SensorIngestService ingestService;
    private final RealtimePushService push;

    public SensorDataHandler(SensorIngestService ingestService, RealtimePushService push) {
        this.ingestService = ingestService;
        this.push = push;
    }

    public void handle(String payload) {
        SensorTick tick = MqttPayloadParser.parseSensorData(payload).orElse(null);
        if (tick == null) {
            log.warn("Ignoring malformed sensor_data '{}'", payload);
            return;
        }
        try {
            List<SensorReadingDto> readings = ingestService.ingest(tick);
            push.pushSensorReadings(readings);
        } catch (RuntimeException e) {
            // DB down etc. — drop this tick, keep the MQTT thread alive.
            log.error("Sensor ingest failed for '{}': {}", payload, e.getMessage());
        }
    }
}
