package vn.ptit.iot.nexora.mqtt;

import java.nio.charset.StandardCharsets;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.paho.client.mqttv3.IMqttDeliveryToken;
import org.eclipse.paho.client.mqttv3.MqttCallback;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import vn.ptit.iot.nexora.service.ApiException;

/**
 * Connection to the Mosquitto broker. Topics are fixed by the ESP32 firmware:
 *   sensor_data (ESP32 -> BE), device_control (BE -> ESP32), device_response (ESP32 -> BE).
 * Every received message is re-published as a Spring event {@link Message}; SensorService and
 * DeviceService listen to it.
 */
@Slf4j
@Service
public class MqttService implements MqttCallback {

    public static final String SENSOR_DATA = "sensor_data";
    public static final String DEVICE_CONTROL = "device_control";
    public static final String DEVICE_RESPONSE = "device_response";

    /** A message received from the broker. */
    public record Message(String topic, String payload) {
    }

    private final ApplicationEventPublisher events;
    private final MqttConnectOptions options = new MqttConnectOptions();
    private final MqttClient client;

    public MqttService(ApplicationEventPublisher events,
                       @Value("${mqtt.host}") String host, @Value("${mqtt.port}") int port,
                       @Value("${mqtt.username}") String username, @Value("${mqtt.password}") String password)
            throws MqttException {
        this.events = events;
        options.setUserName(username);
        options.setPassword(password.toCharArray());
        options.setConnectionTimeout(5);
        client = new MqttClient("tcp://" + host + ":" + port, "nexora-be-" + UUID.randomUUID(), new MemoryPersistence());
        client.setCallback(this);
    }

    /** Connects at startup and reconnects every 5s if the broker was down or the link dropped. */
    @Scheduled(fixedDelay = 5000)
    public void keepConnected() {
        if (client.isConnected()) return;
        try {
            client.connect(options);
            client.subscribe(new String[]{SENSOR_DATA, DEVICE_RESPONSE});
            // "{}" is no command for the firmware: the ESP32 only answers with its LED state -> DB in sync.
            publish(DEVICE_CONTROL, "{}");
            log.info("MQTT connected to {}", client.getServerURI());
        } catch (MqttException e) {
            log.warn("MQTT connect to {} failed ({}), retrying in 5s", client.getServerURI(), e.getMessage());
        }
    }

    public void publish(String topic, String payload) {
        try {
            client.publish(topic, payload.getBytes(StandardCharsets.UTF_8), 1, false);
        } catch (MqttException e) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Không kết nối được MQTT broker");
        }
    }

    @Override
    public void messageArrived(String topic, MqttMessage message) {
        try {
            events.publishEvent(new Message(topic, new String(message.getPayload(), StandardCharsets.UTF_8)));
        } catch (RuntimeException e) {
            log.error("Handling MQTT message on {} failed", topic, e); // must not throw: Paho would disconnect
        }
    }

    @Override
    public void connectionLost(Throwable cause) {
        log.warn("MQTT connection lost, reconnecting");
    }

    @Override
    public void deliveryComplete(IMqttDeliveryToken token) {
    }
}
