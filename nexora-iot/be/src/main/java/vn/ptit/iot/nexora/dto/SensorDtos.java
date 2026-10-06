package vn.ptit.iot.nexora.dto;

import java.time.LocalDateTime;
import vn.ptit.iot.nexora.entity.DataSensor;
import vn.ptit.iot.nexora.entity.Sensor;

/** Sensor read models (FE `SensorInfo`, `SensorReading`, `ChartPoint`). */
public final class SensorDtos {

    private SensorDtos() {
    }

    public record SensorInfoDto(int sensorsId, String sensorsName, String unit) {

        public static SensorInfoDto from(Sensor s) {
            return new SensorInfoDto(s.getId(), s.getName(), s.getUnit());
        }
    }

    public record SensorReadingDto(int id, int sensorsId, double value, LocalDateTime time) {

        public static SensorReadingDto from(DataSensor d) {
            return new SensorReadingDto(d.getId(), d.getSensorId(), d.getValue(), d.getTime());
        }
    }

    public record ChartPointDto(LocalDateTime time, double value) {
    }
}
