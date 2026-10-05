package vn.ptit.iot.nexora.service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.ptit.iot.nexora.dto.SensorDtos.SensorReadingDto;
import vn.ptit.iot.nexora.entity.DataSensor;
import vn.ptit.iot.nexora.entity.Sensor;
import vn.ptit.iot.nexora.mqtt.MqttPayloadParser.SensorTick;
import vn.ptit.iot.nexora.repository.DataSensorRepository;

/**
 * Internal API-11: one tick -> 3 rows sharing the server receive time (ESP32 sends no clock).
 * humid = -1 rows are stored on purpose (FE renders "Không có dữ liệu").
 */
@Service
public class SensorIngestService {

    private final DataSensorRepository dataSensorRepository;

    public SensorIngestService(DataSensorRepository dataSensorRepository) {
        this.dataSensorRepository = dataSensorRepository;
    }

    @Transactional
    public List<SensorReadingDto> ingest(SensorTick tick) {
        LocalDateTime now = LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS);
        List<DataSensor> rows = dataSensorRepository.saveAll(List.of(
                new DataSensor(Sensor.TEMPERATURE_ID, tick.temp(), now),
                new DataSensor(Sensor.HUMIDITY_ID, tick.humid(), now),
                new DataSensor(Sensor.LIGHT_ID, tick.light(), now)));
        return rows.stream().map(SensorReadingDto::from).toList();
    }
}
