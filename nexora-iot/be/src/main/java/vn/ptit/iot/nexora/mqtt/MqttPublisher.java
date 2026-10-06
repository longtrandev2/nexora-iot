package vn.ptit.iot.nexora.mqtt;

/** Outbound MQTT seam (mocked in tests). */
public interface MqttPublisher {

    /**
     * Publishes to the broker.
     *
     * @throws MqttUnavailableException when not connected or the broker rejects the publish
     */
    void publish(String topic, String payload);

    /** Thrown when the broker is unreachable; the control flow maps it to HTTP 503. */
    class MqttUnavailableException extends RuntimeException {
        public MqttUnavailableException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
