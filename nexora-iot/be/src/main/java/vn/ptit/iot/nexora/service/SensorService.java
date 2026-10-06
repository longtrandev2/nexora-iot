package vn.ptit.iot.nexora.service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import vn.ptit.iot.nexora.dto.ApiDto;
import vn.ptit.iot.nexora.dto.ApiDto.ChartPoint;
import vn.ptit.iot.nexora.dto.ApiDto.Paged;
import vn.ptit.iot.nexora.dto.ApiDto.SensorInfo;
import vn.ptit.iot.nexora.dto.ApiDto.SensorReading;
import vn.ptit.iot.nexora.entity.DataSensor;
import vn.ptit.iot.nexora.entity.Sensor;
import vn.ptit.iot.nexora.mqtt.MqttPayloadParser;
import vn.ptit.iot.nexora.mqtt.MqttService;
import vn.ptit.iot.nexora.repository.DataSensorRepository;
import vn.ptit.iot.nexora.repository.SensorRepository;

/** Sensor data: saves every ESP32 tick, serves dashboard / chart / history. */
@Slf4j
@Service
@RequiredArgsConstructor
public class SensorService {

    private final SensorRepository sensors;
    private final DataSensorRepository data;
    private final SimpMessagingTemplate ws;

    /** sensor_data (every 2s) -> 3 rows with the same time -> pushed to /topic/sensors. */
    @EventListener(condition = "#msg.topic() == T(vn.ptit.iot.nexora.mqtt.MqttService).SENSOR_DATA")
    public void onSensorData(MqttService.Message msg) {
        MqttPayloadParser.SensorTick tick = MqttPayloadParser.parseSensors(msg.payload());
        if (tick == null) {
            log.warn("Ignoring bad sensor_data '{}'", msg.payload());
            return;
        }
        LocalDateTime now = LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS);
        List<DataSensor> rows = data.saveAll(List.of(
                new DataSensor(Sensor.TEMPERATURE, tick.temp(), now),
                new DataSensor(Sensor.HUMIDITY, tick.humid(), now),   // -1 kept: FE shows "Không có dữ liệu"
                new DataSensor(Sensor.LIGHT, tick.light(), now)));
        ws.convertAndSend("/topic/sensors", rows.stream().map(SensorReading::from).toList());
    }

    public List<SensorInfo> sensors() {
        return sensors.findAll(Sort.by("id")).stream().map(SensorInfo::from).toList();
    }

    /** The `limit` newest readings of each sensor, newest first. */
    public List<SensorReading> latest(int limit) {
        List<SensorReading> out = new ArrayList<>();
        for (Sensor s : sensors.findAll()) {
            data.findBySensorIdOrderByTimeDescIdDesc(s.getId(), PageRequest.of(0, limit))
                    .forEach(d -> out.add(SensorReading.from(d)));
        }
        out.sort(Comparator.comparing(SensorReading::time).thenComparing(SensorReading::id).reversed());
        return out;
    }

    /** Last `limit` points in [from, to], oldest -> newest. */
    public List<ChartPoint> chart(int sensorId, LocalDateTime from, LocalDateTime to, int limit) {
        List<ChartPoint> points = new ArrayList<>(data.findChart(sensorId, from, to, PageRequest.of(0, limit))
                .stream().map(d -> new ChartPoint(d.getTime(), d.getValue())).toList());
        Collections.reverse(points);
        return points;
    }

    /** search_kind: all | temp | humid | light | time (see DataSensorRepository.search). */
    public Paged<SensorReading> history(Integer sensorId, LocalDateTime from, LocalDateTime to, String search,
                                        String kind, Integer page, Integer limit) {
        String k = kind == null || kind.isBlank() ? "all" : kind;
        Integer sensor = sensorId;
        switch (k) {
            case "temp" -> sensor = Sensor.TEMPERATURE;
            case "humid" -> sensor = Sensor.HUMIDITY;
            case "light" -> sensor = Sensor.LIGHT;
            case "all", "time" -> { }
            default -> throw ApiException.badRequest("search_kind không hợp lệ");
        }
        Pageable pageable = ApiDto.pageable(page, limit);
        if (sensorId != null && !sensorId.equals(sensor)) {   // e.g. sensors_id=2 with kind=temp
            return new Paged<>(List.of(), pageable.getPageNumber() + 1, pageable.getPageSize(), 0);
        }
        String mode = switch (k) { case "temp", "humid", "light" -> "value"; default -> k; };
        return Paged.of(data.search(sensor, from, to, needle(search), mode, pageable), SensorReading::from);
    }

    /** Search text: trimmed, lowercased, LIKE wildcards made literal. */
    static String needle(String search) {
        return search == null ? "" : search.trim().toLowerCase()
                .replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }
}
