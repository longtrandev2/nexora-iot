package vn.ptit.iot.nexora.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessageDeliveryException;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import org.springframework.messaging.converter.MessageConverter;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * STOMP over native WebSocket at /ws (no SockJS). Server pushes only:
 * /topic/sensors (SensorReading[] per tick) and /topic/devices (Device[] on every transition).
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final ObjectMapper objectMapper;
    private final CorsProperties corsProperties;

    public WebSocketConfig(ObjectMapper objectMapper, CorsProperties corsProperties) {
        this.objectMapper = objectMapper;
        this.corsProperties = corsProperties;
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns(corsProperties.allowedOrigins().toArray(String[]::new));
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic");
        registry.setApplicationDestinationPrefixes("/app");
    }

    /**
     * /ws is unauthenticated (read-only demo feed), so clients must not be able to SEND to /topic:
     * the simple broker would relay a forged device/sensor frame to every dashboard.
     */
    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
                String destination = accessor.getDestination();
                if (StompCommand.SEND.equals(accessor.getCommand()) && destination != null
                        && destination.startsWith("/topic")) {
                    throw new MessageDeliveryException("Clients may not publish to " + destination);
                }
                return message;
            }
        });
    }

    /** Reuse the app ObjectMapper so pushes have the same snake_case/time format as REST. */
    @Override
    public boolean configureMessageConverters(List<MessageConverter> converters) {
        MappingJackson2MessageConverter converter = new MappingJackson2MessageConverter();
        converter.setObjectMapper(objectMapper);
        converters.add(converter);
        return false;
    }
}
