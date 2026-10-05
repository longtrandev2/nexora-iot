package vn.ptit.iot.nexora.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import vn.ptit.iot.nexora.config.JacksonConfig;
import vn.ptit.iot.nexora.entity.ActionStatus;
import vn.ptit.iot.nexora.entity.Device;
import vn.ptit.iot.nexora.entity.DeviceStatus;
import vn.ptit.iot.nexora.entity.ToggleAction;

/** Device read/control models (FE `Device`, `DeviceAction`, `ControlInput`, `ControlResult`). */
public final class DeviceDtos {

    private DeviceDtos() {
    }

    /** `updated_at` is "" when the device was never toggled (FE mock seeds empty string). */
    public record DeviceDto(int devicesId, String devicesName, DeviceStatus status, String updatedAt) {

        public static DeviceDto from(Device d) {
            return new DeviceDto(d.getId(), d.getName(), d.getStatus(), JacksonConfig.format(d.getUpdatedAt()));
        }
    }

    public record DeviceActionDto(int id, int devicesId, String devicesName, ToggleAction action,
                                  ActionStatus status, int userId, String userName, LocalDateTime time) {
    }

    /**
     * API-09 body. FE sends camelCase `deviceId` (or `all`); spec/Postman `devices_id` accepted too.
     * `all` (E-1) wins over `deviceId` and doubles as the action, like the mock.
     */
    public record ControlRequest(@JsonProperty("deviceId") @JsonAlias("devices_id") Integer deviceId,
                                 ToggleAction all,
                                 ToggleAction action) {
    }

    public record ControlResult(int devicesId, String devicesName, DeviceStatus status) {

        public static ControlResult from(Device d) {
            return new ControlResult(d.getId(), d.getName(), d.getStatus());
        }
    }
}
