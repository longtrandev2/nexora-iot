package vn.ptit.iot.nexora.mqtt;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.entry;

import org.junit.jupiter.api.Test;
import vn.ptit.iot.nexora.entity.DeviceStatus;
import vn.ptit.iot.nexora.entity.ToggleAction;
import vn.ptit.iot.nexora.mqtt.MqttPayloadParser.SensorTick;

/** Payload samples are exactly what esp32-mqtt-node.ino emits / parses. */
class MqttPayloadParserTest {

    @Test
    void parsesFullStateDeviceResponse() {
        assertThat(MqttPayloadParser.parseLedStates("{led1:on,led2:off,led3:on}"))
                .containsExactly(entry(1, DeviceStatus.on), entry(2, DeviceStatus.off), entry(3, DeviceStatus.on));
    }

    @Test
    void ledParsingIsLenientOnCaseAndSpaces() {
        assertThat(MqttPayloadParser.parseLedStates("{ LED2 : ON }")).containsEntry(2, DeviceStatus.on).hasSize(1);
    }

    @Test
    void bulkCommandEchoHasNoLedKeys() {
        assertThat(MqttPayloadParser.parseLedStates("{all:on}")).isEmpty();
    }

    @Test
    void garbageYieldsEmptyResults() {
        assertThat(MqttPayloadParser.parseLedStates("garbage")).isEmpty();
        assertThat(MqttPayloadParser.parseLedStates(null)).isEmpty();
        assertThat(MqttPayloadParser.parseSensorData("garbage")).isEmpty();
        assertThat(MqttPayloadParser.parseSensorData(null)).isEmpty();
    }

    @Test
    void parsesSensorTickWithUnits() {
        assertThat(MqttPayloadParser.parseSensorData("{temp:29.50C,humid:60%,light:45%}"))
                .contains(new SensorTick(29.5, 60, 45));
    }

    @Test
    void keepsHumidityAbsentMarker() {
        assertThat(MqttPayloadParser.parseSensorData("{temp:25.00C,humid:-1%,light:67%}"))
                .contains(new SensorTick(25.0, -1, 67));
    }

    @Test
    void partialSensorTickIsRejected() {
        assertThat(MqttPayloadParser.parseSensorData("{temp:25.00C,light:67%}")).isEmpty();
        assertThat(MqttPayloadParser.parseSensorData("{temp:nanC,humid:60%,light:67%}")).isEmpty();
    }

    @Test
    void controlPayloadsMatchFirmwareIndexOfKeys() {
        assertThat(MqttPayloadParser.controlPayload(2, ToggleAction.on)).isEqualTo("{led2:on}");
        assertThat(MqttPayloadParser.controlPayload(null, ToggleAction.off)).isEqualTo("{all:off}");
    }
}
