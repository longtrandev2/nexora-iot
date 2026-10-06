package vn.ptit.iot.nexora.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.function.Function;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import vn.ptit.iot.nexora.entity.DataSensor;
import vn.ptit.iot.nexora.entity.Device;
import vn.ptit.iot.nexora.entity.DeviceAction;
import vn.ptit.iot.nexora.entity.Sensor;
import vn.ptit.iot.nexora.entity.User;
import vn.ptit.iot.nexora.service.ApiException;

/**
 * Every JSON body of the API. Keys become snake_case (spring.jackson.property-naming-strategy),
 * times are "yyyy-MM-dd HH:mm:ss" local time — the exact shapes of fe/src/types/iot.ts.
 */
public final class ApiDto {

    public static final String TIME_PATTERN = "yyyy-MM-dd HH:mm:ss";

    private ApiDto() {
    }

    // ---------- auth ----------

    public record LoginRequest(String username, String password) {
    }

    public record LoginResponse(String token, UserDto user) {
    }

    public record UserDto(int userId, String username, String email, String fullname, String avatarUrl,
                          String githubUrl, String figmaUrl, String postmanUrl, String docsUrl, String bio) {
        public static UserDto from(User u) {
            return new UserDto(u.getId(), u.getUsername(), u.getEmail(), u.getFullname(), u.getAvatarUrl(),
                    u.getGithubUrl(), u.getFigmaUrl(), u.getPostmanUrl(), u.getDocsUrl(), u.getBio());
        }
    }

    /** Partial profile update: null = keep the current value. */
    public record ProfileUpdate(String fullname, String email, String username, String avatarUrl, String githubUrl,
                                String figmaUrl, String postmanUrl, String docsUrl, String bio) {
    }

    public record PasswordChange(String oldPassword, String newPassword) {
    }

    public record Message(boolean success, String message) {
    }

    public record ErrorBody(String error) {
    }

    // ---------- sensors ----------

    public record SensorInfo(int sensorsId, String sensorsName, String unit) {
        public static SensorInfo from(Sensor s) {
            return new SensorInfo(s.getId(), s.getName(), s.getUnit());
        }
    }

    public record SensorReading(int id, int sensorsId, double value,
                                @JsonFormat(pattern = TIME_PATTERN) LocalDateTime time) {
        public static SensorReading from(DataSensor d) {
            return new SensorReading(d.getId(), d.getSensorId(), d.getValue(), d.getTime());
        }
    }

    public record ChartPoint(@JsonFormat(pattern = TIME_PATTERN) LocalDateTime time, double value) {
    }

    // ---------- devices ----------

    /** updated_at is "" when the LED was never switched. */
    public record DeviceDto(int devicesId, String devicesName, Device.Status status, String updatedAt) {
        public static DeviceDto from(Device d) {
            String updated = d.getUpdatedAt() == null ? ""
                    : d.getUpdatedAt().format(DateTimeFormatter.ofPattern(TIME_PATTERN));
            return new DeviceDto(d.getId(), d.getName(), d.getStatus(), updated);
        }
    }

    public record DeviceActionDto(int id, int devicesId, String devicesName, DeviceAction.Command action,
                                  DeviceAction.Result status, int userId, String userName,
                                  @JsonFormat(pattern = TIME_PATTERN) LocalDateTime time) {
    }

    /** One LED: {"deviceId":2,"action":"on"} (or "devices_id"); all LEDs: {"all":"on"}. */
    public record ControlRequest(@JsonProperty("deviceId") @JsonAlias("devices_id") Integer deviceId,
                                 DeviceAction.Command all, DeviceAction.Command action) {
    }

    public record ControlResult(int devicesId, String devicesName, Device.Status status) {
        public static ControlResult from(Device d) {
            return new ControlResult(d.getId(), d.getName(), d.getStatus());
        }
    }

    // ---------- paging ----------

    public record Paged<T>(List<T> items, int page, int limit, long total) {
        public static <E, T> Paged<T> of(Page<E> page, Function<E, T> mapper) {
            return new Paged<>(page.getContent().stream().map(mapper).toList(),
                    page.getNumber() + 1, page.getSize(), page.getTotalElements());
        }
    }

    /** page starts at 1 (default 1), limit 1..500 (default 20). */
    public static Pageable pageable(Integer page, Integer limit) {
        int p = page == null ? 1 : page;
        int l = limit == null ? 20 : limit;
        if (p < 1 || l < 1 || l > 500) throw ApiException.badRequest("Tham số phân trang không hợp lệ");
        return PageRequest.of(p - 1, l);
    }
}
