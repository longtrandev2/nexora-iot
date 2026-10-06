package vn.ptit.iot.nexora.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

/** devices table (seeded LED 1..3; id N <-> MQTT `ledN`). */
@Entity
@Table(name = "devices")
public class Device {

    @Id
    private Integer id;

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeviceStatus status;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public Integer getId() { return id; }
    public String getName() { return name; }
    public DeviceStatus getStatus() { return status; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    /** Status transition; every transition also stamps updated_at (FE "Cập nhật: ..."). */
    public void changeStatus(DeviceStatus status, LocalDateTime at) {
        this.status = status;
        this.updatedAt = at;
    }
}
