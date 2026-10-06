package vn.ptit.iot.nexora.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Table `actions`: one on/off command sent by a user and its result. */
@Entity
@Table(name = "actions", indexes = {
        @Index(name = "idx_act_device_time", columnList = "device_id, time"),
        @Index(name = "idx_act_time", columnList = "time")})
@Getter
@Setter
@NoArgsConstructor
public class DeviceAction {

    public enum Command { on, off }

    /** loading = waiting for the ESP32's device_response. */
    public enum Result { success, failed, loading }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private Integer deviceId;

    @Column(nullable = false)
    private Integer userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Command action;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Result status;

    @Column(nullable = false)
    private LocalDateTime time;

    public DeviceAction(int deviceId, int userId, Command action, LocalDateTime time) {
        this.deviceId = deviceId;
        this.userId = userId;
        this.action = action;
        this.status = Result.loading;
        this.time = time;
    }
}
