package vn.ptit.iot.nexora.repository;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;
import vn.ptit.iot.nexora.dto.HistoryFilters.SensorHistoryFilter;
import vn.ptit.iot.nexora.dto.HistoryFilters.SensorSearchKind;
import vn.ptit.iot.nexora.dto.PageParams;
import vn.ptit.iot.nexora.dto.PagedResponse;
import vn.ptit.iot.nexora.dto.SensorDtos.SensorReadingDto;

/**
 * API-07 sensor log search (native MySQL: DATE_FORMAT / CAST). `search_kind` semantics:
 * temp|humid|light -> that sensor + value PREFIX; time -> time contains (3 formats);
 * all -> value prefix OR sensor name contains OR id contains OR time contains.
 */
@Repository
public class SensorHistoryRepository {

    private static final String FROM = " FROM data_sensors ds JOIN sensors s ON s.id = ds.sensor_id";
    /** MySQL prints DOUBLE like the FE displays it (25.1, 60, -1), so "25" prefix-matches 25.1 not 2.25. */
    private static final String VALUE_PREFIX = "CAST(ds.value AS CHAR) LIKE :prefix";

    private static final RowMapper<SensorReadingDto> ROW = (rs, i) -> new SensorReadingDto(
            rs.getInt("id"), rs.getInt("sensor_id"), rs.getDouble("value"),
            rs.getObject("time", LocalDateTime.class));

    private final NamedParameterJdbcTemplate jdbc;

    public SensorHistoryRepository(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public PagedResponse<SensorReadingDto> search(SensorHistoryFilter filter, PageParams page) {
        SensorSearchKind kind = filter.kind() == null ? SensorSearchKind.all : filter.kind();
        String needle = SqlSearch.normalizeNeedle(filter.search());

        SqlSearch q = new SqlSearch()
                .eq("ds.sensor_id", "sensorId", filter.sensorsId())
                .eq("ds.sensor_id", "kindSensorId", kind.sensorId)
                .timeRange("ds.time", filter.from(), filter.to());
        if (!needle.isEmpty()) {
            q.bindNeedle(needle).and(switch (kind) {
                case time -> SqlSearch.timeContains("ds.time");
                case all -> VALUE_PREFIX
                        + " OR LOWER(s.name) LIKE :contains"
                        + " OR CAST(ds.id AS CHAR) LIKE :contains"
                        + " OR " + SqlSearch.timeContains("ds.time");
                case temp, humid, light -> VALUE_PREFIX;
            });
        }

        Long total = jdbc.queryForObject("SELECT COUNT(*)" + FROM + q.where(), q.params(), Long.class);
        q.params().addValue("limit", page.limit()).addValue("offset", page.offset());
        List<SensorReadingDto> items = jdbc.query(
                "SELECT ds.id, ds.sensor_id, ds.value, ds.time" + FROM + q.where()
                        + " ORDER BY ds.time DESC, ds.id DESC LIMIT :limit OFFSET :offset",
                q.params(), ROW);
        return page.wrap(items, total == null ? 0 : total);
    }
}
