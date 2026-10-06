package vn.ptit.iot.nexora.repository;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;
import vn.ptit.iot.nexora.dto.DeviceDtos.DeviceActionDto;
import vn.ptit.iot.nexora.dto.HistoryFilters.DeviceHistoryFilter;
import vn.ptit.iot.nexora.dto.PageParams;
import vn.ptit.iot.nexora.dto.PagedResponse;
import vn.ptit.iot.nexora.entity.ActionStatus;
import vn.ptit.iot.nexora.entity.ToggleAction;

/**
 * API-10 action log: filters device/action/status/range + time-contains search (3 formats),
 * joined with devices (name) and users (fullname -> user_name, E-2). Newest first.
 */
@Repository
public class DeviceHistoryRepository {

    private static final String FROM = " FROM actions a"
            + " JOIN devices d ON d.id = a.device_id"
            + " JOIN users u ON u.id = a.user_id";

    private static final RowMapper<DeviceActionDto> ROW = (rs, i) -> new DeviceActionDto(
            rs.getInt("id"), rs.getInt("device_id"), rs.getString("device_name"),
            ToggleAction.valueOf(rs.getString("action")), ActionStatus.valueOf(rs.getString("status")),
            rs.getInt("user_id"), rs.getString("user_name"), rs.getObject("time", LocalDateTime.class));

    private final NamedParameterJdbcTemplate jdbc;

    public DeviceHistoryRepository(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public PagedResponse<DeviceActionDto> search(DeviceHistoryFilter filter, PageParams page) {
        String needle = SqlSearch.normalizeNeedle(filter.search());
        SqlSearch q = new SqlSearch()
                .eq("a.device_id", "deviceId", filter.deviceId())
                .eq("a.action", "action", filter.action() == null ? null : filter.action().name())
                .eq("a.status", "status", filter.status() == null ? null : filter.status().name())
                .timeRange("a.time", filter.from(), filter.to());
        if (!needle.isEmpty()) {
            q.bindNeedle(needle).and(SqlSearch.timeContains("a.time"));
        }

        Long total = jdbc.queryForObject("SELECT COUNT(*)" + FROM + q.where(), q.params(), Long.class);
        q.params().addValue("limit", page.limit()).addValue("offset", page.offset());
        List<DeviceActionDto> items = jdbc.query(
                "SELECT a.id, a.device_id, d.name AS device_name, a.action, a.status, a.user_id,"
                        + " u.fullname AS user_name, a.time" + FROM + q.where()
                        + " ORDER BY a.time DESC, a.id DESC LIMIT :limit OFFSET :offset",
                q.params(), ROW);
        return page.wrap(items, total == null ? 0 : total);
    }
}
