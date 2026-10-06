package vn.ptit.iot.nexora.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** Table `sensors`: fixed ids 1 Nhiệt độ, 2 Độ ẩm, 3 Ánh sáng (created by DataSeeder). */
@Entity
@Table(name = "sensors")
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class Sensor {

    public static final int TEMPERATURE = 1;
    public static final int HUMIDITY = 2;
    public static final int LIGHT = 3;

    @Id
    private Integer id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 10)
    private String unit;
}
