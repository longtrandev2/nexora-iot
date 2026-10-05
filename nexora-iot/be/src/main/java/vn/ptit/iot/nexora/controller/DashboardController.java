package vn.ptit.iot.nexora.controller;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vn.ptit.iot.nexora.dto.SensorDtos.ChartPointDto;
import vn.ptit.iot.nexora.service.SensorQueryService;

/**
 * Dashboard chart (spec path kept). Body is the FE flat `ChartData` [{time, value}] oldest -> newest.
 * Accepts FE `sensorId` and spec `sensor_id`; `to` optional (FE window ends "now").
 */
@RestController
public class DashboardController {

    private final SensorQueryService sensorQueryService;

    public DashboardController(SensorQueryService sensorQueryService) {
        this.sensorQueryService = sensorQueryService;
    }

    @GetMapping("/api/v1/dashboard/sensors/chart")
    public List<ChartPointDto> chart(
            @RequestParam(required = false) Integer sensorId,
            @RequestParam(name = "sensor_id", required = false) Integer sensorIdSnake,
            @RequestParam(required = false) LocalDateTime from,
            @RequestParam(required = false) LocalDateTime to,
            @RequestParam(required = false) Integer limit) {
        return sensorQueryService.chart(sensorId != null ? sensorId : sensorIdSnake, from, to, limit);
    }
}
