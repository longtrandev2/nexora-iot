package vn.ptit.iot.nexora.mqtt;

import jakarta.annotation.PreDestroy;
import java.nio.charset.StandardCharsets;
import java.util.UUID;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import org.eclipse.paho.client.mqttv3.IMqttDeliveryToken;
import org.eclipse.paho.client.mqttv3.MqttCallback;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import vn.ptit.iot.nexora.config.MqttProperties;

/**
 * Single Paho client: connects in the background (broker down at boot never crashes the app),
 * re-tries every 5s after a loss, (re)subscribes both inbound topics on each connect and routes
 * messages to their handlers. Handler exceptions are contained — a throwing messageArrived
 * would make Paho drop the connection.
 */
@Component
public class MqttConnectionManager implements MqttPublisher, MqttCallback {

    private static final Logger log = LoggerFactory.getLogger(MqttConnectionManager.class);
    private static final long RETRY_SECONDS = 5;

    private final MqttProperties props;
    private final DeviceResponseHandler deviceResponseHandler;
    private final SensorDataHandler sensorDataHandler;
    private final ScheduledExecutorService connector = Executors.newSingleThreadScheduledExecutor(r -> {
        Thread t = new Thread(r, "mqtt-connector");
        t.setDaemon(true);
        return t;
    });
    private volatile MqttClient client;

    public MqttConnectionManager(MqttProperties props, DeviceResponseHandler deviceResponseHandler,
                                 SensorDataHandler sensorDataHandler) {
        this.props = props;
        this.deviceResponseHandler = deviceResponseHandler;
        this.sensorDataHandler = sensorDataHandler;
    }

    /** Starts only once the context is fully up, so inbound messages never race bean creation. */
    @EventListener(ApplicationReadyEvent.class)
    public void start() {
        if (!props.enabled()) {
            log.info("MQTT disabled (mqtt.enabled=false): device control will answer 503");
            return;
        }
        try {
            String clientId = "nexora-be-" + UUID.randomUUID().toString().substring(0, 8);
            client = new MqttClient(props.serverUri(), clientId, new MemoryPersistence());
            client.setCallback(this);
            connector.scheduleWithFixedDelay(this::ensureConnected, 0, RETRY_SECONDS, TimeUnit.SECONDS);
        } catch (MqttException e) {
            log.error("Invalid MQTT config {}: {}", props.serverUri(), e.getMessage());
        }
    }

    /** Runs every 5s on the connector thread; must never throw (that would cancel the schedule). */
    private void ensureConnected() {
        MqttClient c = client;
        if (c == null || c.isConnected()) return;
        try {
            c.connect(connectOptions());
            c.subscribe(new String[]{props.topics().sensorData(), props.topics().deviceResponse()}, new int[]{0, 0});
            log.info("MQTT connected to {}, subscribed {}, {}", props.serverUri(),
                    props.topics().sensorData(), props.topics().deviceResponse());
            // "{}" matches no firmware command but makes the ESP32 echo its full LED state,
            // re-syncing devices.status with the hardware after every (re)connect.
            c.publish(props.topics().deviceControl(), "{}".getBytes(StandardCharsets.UTF_8), 1, false);
        } catch (MqttException | RuntimeException e) {
            log.warn("MQTT connect to {} failed ({}), retry in {}s", props.serverUri(), e.getMessage(), RETRY_SECONDS);
            forceDisconnect(c); // connected-but-unsubscribed must not look healthy to the next run
        }
    }

    private void forceDisconnect(MqttClient c) {
        try {
            if (c.isConnected()) c.disconnectForcibly(1000, 1000);
        } catch (MqttException | RuntimeException e) {
            log.debug("MQTT forced disconnect: {}", e.getMessage());
        }
    }

    private MqttConnectOptions connectOptions() {
        MqttConnectOptions options = new MqttConnectOptions();
        options.setCleanSession(true);
        options.setAutomaticReconnect(false); // our 5s loop owns reconnect + resubscribe
        options.setConnectionTimeout(5);
        options.setKeepAliveInterval(30);
        if (props.username() != null && !props.username().isBlank()) {
            options.setUserName(props.username());
            options.setPassword(props.password() == null ? new char[0] : props.password().toCharArray());
        }
        return options;
    }

    @Override
    public void publish(String topic, String payload) {
        MqttClient c = client;
        if (c == null || !c.isConnected()) {
            throw new MqttUnavailableException("MQTT broker not connected", null);
        }
        try {
            c.publish(topic, payload.getBytes(StandardCharsets.UTF_8), 1, false);
            log.info("MQTT -> {} {}", topic, payload);
        } catch (MqttException e) {
            throw new MqttUnavailableException("MQTT publish failed: " + e.getMessage(), e);
        }
    }

    @Override
    public void messageArrived(String topic, MqttMessage message) {
        String payload = new String(message.getPayload(), StandardCharsets.UTF_8);
        try {
            if (topic.equals(props.topics().deviceResponse())) {
                deviceResponseHandler.handle(payload);
            } else if (topic.equals(props.topics().sensorData())) {
                sensorDataHandler.handle(payload);
            }
        } catch (RuntimeException e) {
            log.error("MQTT handler failed for {} '{}'", topic, payload, e);
        }
    }

    @Override
    public void connectionLost(Throwable cause) {
        log.warn("MQTT connection lost ({}), reconnecting every {}s",
                cause == null ? "unknown" : cause.getMessage(), RETRY_SECONDS);
    }

    @Override
    public void deliveryComplete(IMqttDeliveryToken token) {
        // QoS 1 ack — nothing to do; the device_response topic is the real confirmation.
    }

    @PreDestroy
    void stop() {
        connector.shutdownNow();
        MqttClient c = client;
        if (c == null) return;
        try {
            if (c.isConnected()) c.disconnect(1000);
            c.close();
        } catch (MqttException e) {
            log.debug("MQTT shutdown: {}", e.getMessage());
        }
    }
}
