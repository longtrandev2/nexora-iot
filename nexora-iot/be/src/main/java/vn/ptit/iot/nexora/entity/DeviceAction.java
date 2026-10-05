package vn.ptit.iot.nexora.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

/** actions row: one control attempt by a user (loading -> success | failed). */
@Entity
@Table(name = "actions")
public class DeviceAction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "device_id", nullable = false)
    private Integer deviceId;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ToggleAction action;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ActionStatus status;

    @Column(nullable = false)
    private LocalDateTime time;

    protected DeviceAction() {
    }

    public DeviceAction(int deviceId, int userId, ToggleAction action, ActionStatus status, LocalDateTime time) {
        this.deviceId = deviceId;
        this.userId = userId;
        this.action = action;
        this.status = status;
        this.time = time;
    }

    public Integer getId() { return id; }
    public Integer getDeviceId() { return deviceId; }
    public Integer getUserId() { return userId; }
    public ToggleAction getAction() { return action; }
    public ActionStatus getStatus() { return status; }
    public void setStatus(ActionStatus status) { this.status = status; }
    public LocalDateTime getTime() { return time; }
}
