package vn.ptit.iot.nexora.mqtt;

import java.util.Map;
import java.util.TreeMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import vn.ptit.iot.nexora.entity.Device;

/**
 * Reads the ESP32 firmware payloads (not strict JSON, spaces allowed):
 *   sensor_data     {temp:29.50C,humid: 9%,light:45%}   humid -1 = DHT11 missing
 *   device_response {led1:on,led2:off,led3:on}          always the state of all 3 LEDs
 * Bad input gives null / an empty map; it never throws.
 */
public final class MqttPayloadParser {

    private static final Pattern LED = Pattern.compile("led([1-3])\\s*:\\s*(on|off)", Pattern.CASE_INSENSITIVE);
    private static final String NUMBER = "\\s*:\\s*(-?\\d+(?:\\.\\d+)?)";
    private static final Pattern TEMP = Pattern.compile("temp" + NUMBER, Pattern.CASE_INSENSITIVE);
    private static final Pattern HUMID = Pattern.compile("humid" + NUMBER, Pattern.CASE_INSENSITIVE);
    private static final Pattern LIGHT = Pattern.compile("light" + NUMBER, Pattern.CASE_INSENSITIVE);

    private MqttPayloadParser() {
    }

    public record SensorTick(double temp, double humid, double light) {
    }

    /** led number -> state; empty when nothing matches. */
    public static Map<Integer, Device.Status> parseLeds(String payload) {
        Map<Integer, Device.Status> states = new TreeMap<>();
        Matcher m = LED.matcher(payload == null ? "" : payload);
        while (m.find()) states.put(Integer.parseInt(m.group(1)), Device.Status.valueOf(m.group(2).toLowerCase()));
        return states;
    }

    /** The 3 values of one tick, or null if any is missing. */
    public static SensorTick parseSensors(String payload) {
        if (payload == null) return null;
        Double temp = number(TEMP, payload);
        Double humid = number(HUMID, payload);
        Double light = number(LIGHT, payload);
        return temp == null || humid == null || light == null ? null : new SensorTick(temp, humid, light);
    }

    private static Double number(Pattern pattern, String payload) {
        Matcher m = pattern.matcher(payload);
        return m.find() ? Double.valueOf(m.group(1)) : null;
    }
}
