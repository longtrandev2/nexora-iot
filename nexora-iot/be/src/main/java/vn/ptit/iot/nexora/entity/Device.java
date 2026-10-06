package vn.ptit.iot.nexora.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Table `devices`: LED 1..3 — id N is `ledN` in the ESP32 firmware. */
@Entity
@Table(name = "devices")
@Getter
@Setter
@NoArgsConstructor
public class Device {

    /** Lowercase = the exact values in the DB and in the FE JSON. loading = command in flight. */
    public enum Status { on, off, loading }

    @Id
    private Integer id;

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.off;

    private LocalDateTime updatedAt;

    public Device(Integer id, String name) {
        this.id = id;
        this.name = name;
    }
}
