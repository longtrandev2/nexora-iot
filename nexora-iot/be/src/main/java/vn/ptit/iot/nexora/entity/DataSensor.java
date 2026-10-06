package vn.ptit.iot.nexora.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** Table `data_sensors`: one measurement. value = -1 means "no data" (DHT11 missing). */
@Entity
@Table(name = "data_sensors", indexes = {
        @Index(name = "idx_ds_sensor_time", columnList = "sensor_id, time"),
        @Index(name = "idx_ds_time", columnList = "time")})
@Getter
@NoArgsConstructor
public class DataSensor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private Integer sensorId;

    @Column(nullable = false)
    private double value;

    @Column(nullable = false)
    private LocalDateTime time;

    public DataSensor(int sensorId, double value, LocalDateTime time) {
        this.sensorId = sensorId;
        this.value = value;
        this.time = time;
    }
}
