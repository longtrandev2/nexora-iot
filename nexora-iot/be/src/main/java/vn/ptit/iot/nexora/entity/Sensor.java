package vn.ptit.iot.nexora.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

/** sensors catalog (seeded): 1 Nhiệt độ °C, 2 Độ ẩm %, 3 Ánh sáng %. */
@Entity
@Table(name = "sensors")
public class Sensor {

    public static final int TEMPERATURE_ID = 1;
    public static final int HUMIDITY_ID = 2;
    public static final int LIGHT_ID = 3;

    @Id
    private Integer id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 10)
    private String unit;

    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public Integer getId() { return id; }
    public String getName() { return name; }
    public String getUnit() { return unit; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
