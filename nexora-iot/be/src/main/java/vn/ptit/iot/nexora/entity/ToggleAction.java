package vn.ptit.iot.nexora.entity;

/** LED command (actions.action ENUM); same words the ESP32 parses in `ledN:on|off`. */
public enum ToggleAction {
    on, off;

    /** The device status a successful command of this action produces. */
    public DeviceStatus targetStatus() {
        return this == on ? DeviceStatus.on : DeviceStatus.off;
    }
}
