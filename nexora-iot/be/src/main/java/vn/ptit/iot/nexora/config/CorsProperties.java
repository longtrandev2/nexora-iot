package vn.ptit.iot.nexora.config;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

/** Browser origins allowed for REST (CORS) and the /ws STOMP handshake. */
@ConfigurationProperties("cors")
public record CorsProperties(List<String> allowedOrigins) {
}
