package vn.ptit.iot.nexora.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.ptit.iot.nexora.dto.HistoryFilters.SensorHistoryFilter;
import vn.ptit.iot.nexora.dto.PageParams;
import vn.ptit.iot.nexora.dto.PagedResponse;
import vn.ptit.iot.nexora.dto.SensorDtos.ChartPointDto;
import vn.ptit.iot.nexora.dto.SensorDtos.SensorInfoDto;
import vn.ptit.iot.nexora.dto.SensorDtos.SensorReadingDto;
import vn.ptit.iot.nexora.entity.Sensor;
import vn.ptit.iot.nexora.repository.DataSensorRepository;
import vn.ptit.iot.nexora.repository.SensorHistoryRepository;
import vn.ptit.iot.nexora.repository.SensorRepository;

/** Sensor catalog, latest readings, chart window and history search (API-04..07). */
@Service
@Transactional(readOnly = true)
public class SensorQueryService {

    static final int DEFAULT_CHART_LIMIT = 200;
    static final int MAX_CHART_LIMIT = 5000;
    static final int MAX_LATEST_LIMIT = 500;

    /** Newest first; id breaks ties inside one tick (3 rows share a timestamp). */
    private static final Comparator<SensorReadingDto> NEWEST_FIRST = Comparator
            .comparing(SensorReadingDto::time).thenComparing(SensorReadingDto::id).reversed();

    private final SensorRepository sensorRepository;
    private final DataSensorRepository dataSensorRepository;
    private final SensorHistoryRepository historyRepository;

    public SensorQueryService(SensorRepository sensorRepository, DataSensorRepository dataSensorRepository,
                              SensorHistoryRepository historyRepository) {
        this.sensorRepository = sensorRepository;
        this.dataSensorRepository = dataSensorRepository;
        this.historyRepository = historyRepository;
    }

    public List<SensorInfoDto> sensors() {
        return sensorRepository.findAll(Sort.by("id")).stream().map(SensorInfoDto::from).toList();
    }

    /** Top-`limit` readings PER sensor, merged newest first (one indexed query per sensor). */
    public List<SensorReadingDto> latest(Integer limit) {
        int n = limit == null ? 1 : limit;
        if (n < 1 || n > MAX_LATEST_LIMIT) {
            throw ApiException.badRequest("limit phải từ 1 đến " + MAX_LATEST_LIMIT);
        }
        List<SensorReadingDto> out = new ArrayList<>();
        for (Sensor sensor : sensorRepository.findAll(Sort.by("id"))) {
            dataSensorRepository.findBySensorIdOrderByTimeDescIdDesc(sensor.getId(), PageRequest.of(0, n))
                    .forEach(d -> out.add(SensorReadingDto.from(d)));
        }
        out.sort(NEWEST_FIRST);
        return out;
    }

    /** Last `limit` points of one sensor in [from, to], returned oldest -> newest (FE ChartData). */
    public List<ChartPointDto> chart(Integer sensorId, LocalDateTime from, LocalDateTime to, Integer limit) {
        if (sensorId == null) throw ApiException.badRequest("Thiếu sensorId");
        int n = limit == null ? DEFAULT_CHART_LIMIT : limit;
        if (n < 1 || n > MAX_CHART_LIMIT) {
            throw ApiException.badRequest("limit phải từ 1 đến " + MAX_CHART_LIMIT);
        }
        List<ChartPointDto> points = new ArrayList<>(dataSensorRepository
                .findChartWindow(sensorId, from, to, PageRequest.of(0, n)).stream()
                .map(d -> new ChartPointDto(d.getTime(), d.getValue()))
                .toList());
        Collections.reverse(points);
        return points;
    }

    public PagedResponse<SensorReadingDto> history(SensorHistoryFilter filter, PageParams page) {
        return historyRepository.search(filter, page);
    }
}
