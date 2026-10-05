package vn.ptit.iot.nexora.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Mosquitto broker connection + topic names. Topics are frozen by the ESP32 firmware
 * (iot-bai2-mqtt/esp32-mqtt-node) — change only together with the firmware.
 */
@ConfigurationProperties("mqtt")
public record MqttProperties(
        boolean enabled,
        String host,
        int port,
        String username,
        String password,
        Topics topics) {

    public record Topics(String sensorData, String deviceControl, String deviceResponse) {
    }

    public String serverUri() {
        return "tcp://" + host + ":" + port;
    }
}
