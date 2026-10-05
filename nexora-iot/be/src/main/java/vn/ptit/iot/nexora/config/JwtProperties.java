package vn.ptit.iot.nexora.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** JWT settings: HS256 secret (>= 32 bytes, from JWT_SECRET) and token lifetime. */
@ConfigurationProperties("jwt")
public record JwtProperties(String secret, int ttlHours) {
}
