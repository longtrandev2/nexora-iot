package vn.ptit.iot.nexora.mqtt;

import java.util.Map;
import java.util.Optional;
import java.util.TreeMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import vn.ptit.iot.nexora.entity.DeviceStatus;
import vn.ptit.iot.nexora.entity.ToggleAction;

/**
 * Lenient codec for the ESP32 firmware payloads (NOT strict JSON — frozen format):
 *   sensor_data     {temp:29.50C,humid:60%,light:45%}   (humid -1% = DHT11 absent)
 *   device_response {led1:on,led2:off,led3:on}
 *   device_control  {led2:on} | {all:off}               (firmware matches indexOf("ledN:on"))
 * Malformed input yields empty results — callers log + skip, never throw.
 */
public final class MqttPayloadParser {

    private static final Pattern LED = Pattern.compile("led([1-3])\\s*:\\s*(on|off)", Pattern.CASE_INSENSITIVE);
    private static final String NUMBER = "\\s*:\\s*(-?\\d+(?:\\.\\d+)?)";
    private static final Pattern TEMP = Pattern.compile("temp" + NUMBER, Pattern.CASE_INSENSITIVE);
    private static final Pattern HUMID = Pattern.compile("humid" + NUMBER, Pattern.CASE_INSENSITIVE);
    private static final Pattern LIGHT = Pattern.compile("light" + NUMBER, Pattern.CASE_INSENSITIVE);

    /** Matches no firmware command, so the ESP32 only re-publishes its full LED state. */
    public static final String STATE_ECHO_REQUEST = "{}";

    private MqttPayloadParser() {
    }

    /** One sensor tick; all three values required (no partial inserts). */
    public record SensorTick(double temp, double humid, double light) {
    }

    /** device id (ledN -> N) -> hardware-reported state; empty map when nothing parseable. */
    public static Map<Integer, DeviceStatus> parseLedStates(String payload) {
        Map<Integer, DeviceStatus> states = new TreeMap<>();
        if (payload == null) return states;
        Matcher m = LED.matcher(payload);
        while (m.find()) {
            states.put(Integer.parseInt(m.group(1)), DeviceStatus.valueOf(m.group(2).toLowerCase()));
        }
        return states;
    }

    public static Optional<SensorTick> parseSensorData(String payload) {
        if (payload == null) return Optional.empty();
        Optional<Double> temp = number(TEMP, payload);
        Optional<Double> humid = number(HUMID, payload);
        Optional<Double> light = number(LIGHT, payload);
        if (temp.isEmpty() || humid.isEmpty() || light.isEmpty()) return Optional.empty();
        return Optional.of(new SensorTick(temp.get(), humid.get(), light.get()));
    }

    /**
     * Compact command the firmware understands. Single device sends ONLY its own key so an
     * in-flight command on another LED can never be overwritten by a stale state.
     */
    public static String controlPayload(Integer deviceId, ToggleAction action) {
        String key = deviceId == null ? "all" : "led" + deviceId;
        return "{" + key + ":" + action.name() + "}";
    }

    private static Optional<Double> number(Pattern pattern, String payload) {
        Matcher m = pattern.matcher(payload);
        return m.find() ? Optional.of(Double.parseDouble(m.group(1))) : Optional.empty();
    }
}
