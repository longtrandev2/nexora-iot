package vn.ptit.iot.nexora.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

/** data_sensors row: one measurement. value = -1 is the "no data" marker (kept on purpose). */
@Entity
@Table(name = "data_sensors")
public class DataSensor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "sensor_id", nullable = false)
    private Integer sensorId;

    @Column(nullable = false)
    private double value;

    @Column(nullable = false)
    private LocalDateTime time;

    protected DataSensor() {
    }

    public DataSensor(int sensorId, double value, LocalDateTime time) {
        this.sensorId = sensorId;
        this.value = value;
        this.time = time;
    }

    public Integer getId() { return id; }
    public Integer getSensorId() { return sensorId; }
    public double getValue() { return value; }
    public LocalDateTime getTime() { return time; }
}
