package vn.ptit.iot.nexora.controller;

import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vn.ptit.iot.nexora.dto.ApiDto.ChartPoint;
import vn.ptit.iot.nexora.dto.ApiDto.Paged;
import vn.ptit.iot.nexora.dto.ApiDto.SensorInfo;
import vn.ptit.iot.nexora.dto.ApiDto.SensorReading;
import vn.ptit.iot.nexora.service.ApiException;
import vn.ptit.iot.nexora.service.SensorService;

/** Sensor catalog, latest values, dashboard chart, sensor history. */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class SensorController {

    private final SensorService sensors;

    @GetMapping("/sensors")
    public List<SensorInfo> sensors() {
        return sensors.sensors();
    }

    @GetMapping("/sensors/data")
    public List<SensorReading> latest(@RequestParam(defaultValue = "1") int limit) {
        return sensors.latest(Math.min(Math.max(limit, 1), 500));
    }

    /** Points oldest -> newest; accepts sensorId (FE) or sensor_id. */
    @GetMapping("/dashboard/sensors/chart")
    public List<ChartPoint> chart(@RequestParam(required = false) Integer sensorId,
                                  @RequestParam(name = "sensor_id", required = false) Integer sensorIdAlt,
                                  @RequestParam(required = false) LocalDateTime from,
                                  @RequestParam(required = false) LocalDateTime to,
                                  @RequestParam(defaultValue = "200") int limit) {
        Integer id = sensorId != null ? sensorId : sensorIdAlt;
        if (id == null) throw ApiException.badRequest("Thiếu sensorId");
        return sensors.chart(id, from, to, Math.min(Math.max(limit, 1), 5000));
    }

    @GetMapping("/sensors/history")
    public Paged<SensorReading> history(@RequestParam(name = "sensors_id", required = false) Integer sensorId,
                                        @RequestParam(required = false) LocalDateTime from,
                                        @RequestParam(required = false) LocalDateTime to,
                                        @RequestParam(required = false) String search,
                                        @RequestParam(name = "search_kind", required = false) String kind,
                                        @RequestParam(required = false) Integer page,
                                        @RequestParam(required = false) Integer limit) {
        return sensors.history(sensorId, from, to, search, kind, page, limit);
    }
}
