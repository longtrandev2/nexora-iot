package vn.ptit.iot.nexora.entity;

/**
 * devices.status ENUM — lowercase constants match the DB enum and the FE JSON values 1:1.
 * 'loading' = command in flight, not yet confirmed by the ESP32.
 */
public enum DeviceStatus {
    on, off, loading
}
