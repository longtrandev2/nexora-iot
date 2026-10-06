package vn.ptit.iot.nexora.controller;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vn.ptit.iot.nexora.dto.HistoryFilters.SensorHistoryFilter;
import vn.ptit.iot.nexora.dto.HistoryFilters.SensorSearchKind;
import vn.ptit.iot.nexora.dto.PageParams;
import vn.ptit.iot.nexora.dto.PagedResponse;
import vn.ptit.iot.nexora.dto.SensorDtos.SensorInfoDto;
import vn.ptit.iot.nexora.dto.SensorDtos.SensorReadingDto;
import vn.ptit.iot.nexora.service.SensorQueryService;

/** API-04..07. Query keys are snake_case like the FE `SensorHistoryQuery`. */
@RestController
@RequestMapping("/api/v1/sensors")
public class SensorController {

    private final SensorQueryService sensorQueryService;

    public SensorController(SensorQueryService sensorQueryService) {
        this.sensorQueryService = sensorQueryService;
    }

    @GetMapping
    public List<SensorInfoDto> sensors() {
        return sensorQueryService.sensors();
    }

    @GetMapping("/data")
    public List<SensorReadingDto> latest(@RequestParam(required = false) Integer limit) {
        return sensorQueryService.latest(limit);
    }

    @GetMapping("/history")
    public PagedResponse<SensorReadingDto> history(
            @RequestParam(name = "sensors_id", required = false) Integer sensorsId,
            @RequestParam(required = false) LocalDateTime from,
            @RequestParam(required = false) LocalDateTime to,
            @RequestParam(required = false) String search,
            @RequestParam(name = "search_kind", required = false) String searchKind,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer limit) {
        SensorHistoryFilter filter = new SensorHistoryFilter(sensorsId, from, to, search,
                SensorSearchKind.parse(searchKind));
        return sensorQueryService.history(filter, PageParams.of(page, limit));
    }
}
