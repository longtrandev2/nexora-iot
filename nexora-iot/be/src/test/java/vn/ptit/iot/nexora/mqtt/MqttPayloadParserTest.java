package vn.ptit.iot.nexora.mqtt;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.entry;

import org.junit.jupiter.api.Test;
import vn.ptit.iot.nexora.entity.Device;
import vn.ptit.iot.nexora.mqtt.MqttPayloadParser.SensorTick;

/** Payloads exactly as the real ESP32 (esp32-mqtt-node.ino) sends them. */
class MqttPayloadParserTest {

    @Test
    void readsSensorTick() {
        assertThat(MqttPayloadParser.parseSensors("{temp:29.50C,humid:60%,light:45%}"))
                .isEqualTo(new SensorTick(29.5, 60, 45));
    }

    @Test
    void readsPaddedSingleDigitHumidityFromRealBoard() {
        assertThat(MqttPayloadParser.parseSensors("{temp:36.54C,humid: 9%,light:55%}"))
                .isEqualTo(new SensorTick(36.54, 9, 55));
    }

    @Test
    void keepsMissingHumidityMarker() {
        assertThat(MqttPayloadParser.parseSensors("{temp:25.00C,humid:-1%,light:67%}"))
                .isEqualTo(new SensorTick(25, -1, 67));
    }

    @Test
    void rejectsIncompleteOrGarbage() {
        assertThat(MqttPayloadParser.parseSensors("{temp:25.00C,light:67%}")).isNull();
        assertThat(MqttPayloadParser.parseSensors("hello")).isNull();
        assertThat(MqttPayloadParser.parseLeds("garbage")).isEmpty();
    }

    @Test
    void readsAllLedStates() {
        assertThat(MqttPayloadParser.parseLeds("{led1:on,led2:off,led3:on}"))
                .containsExactly(entry(1, Device.Status.on), entry(2, Device.Status.off), entry(3, Device.Status.on));
    }
}
