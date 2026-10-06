package vn.ptit.iot.nexora.dto;

import java.time.LocalDateTime;
import java.util.Locale;
import vn.ptit.iot.nexora.entity.ActionStatus;
import vn.ptit.iot.nexora.entity.Sensor;
import vn.ptit.iot.nexora.entity.ToggleAction;
import vn.ptit.iot.nexora.service.ApiException;

/** Query filters for the two history endpoints (API-07, API-10). All fields optional. */
public final class HistoryFilters {

    private HistoryFilters() {
    }

    /** How `search` is interpreted on the sensor log (FE `SensorSearchKind`). */
    public enum SensorSearchKind {
        all(null), temp(Sensor.TEMPERATURE_ID), humid(Sensor.HUMIDITY_ID), light(Sensor.LIGHT_ID), time(null);

        /** Sensor the kind is restricted to (temp/humid/light), null otherwise. */
        public final Integer sensorId;

        SensorSearchKind(Integer sensorId) {
            this.sensorId = sensorId;
        }

        public static SensorSearchKind parse(String raw) {
            if (raw == null || raw.isBlank()) return all;
            try {
                return valueOf(raw.trim().toLowerCase(Locale.ROOT));
            } catch (IllegalArgumentException e) {
                throw ApiException.badRequest("search_kind không hợp lệ (all, temp, humid, light, time)");
            }
        }
    }

    public record SensorHistoryFilter(Integer sensorsId, LocalDateTime from, LocalDateTime to,
                                      String search, SensorSearchKind kind) {
    }

    public record DeviceHistoryFilter(Integer deviceId, ToggleAction action, ActionStatus status,
                                      LocalDateTime from, LocalDateTime to, String search) {
    }
}
