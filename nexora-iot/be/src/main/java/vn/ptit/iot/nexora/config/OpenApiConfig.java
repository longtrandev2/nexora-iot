package vn.ptit.iot.nexora.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.core.jackson.ModelResolver;
import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Swagger UI: http://localhost:8080/swagger-ui.html (JSON: /v3/api-docs).
 * Call POST /api/v1/auth/login, copy "token", click "Authorize" and paste it.
 */
@Configuration
@OpenAPIDefinition(
        info = @Info(title = "NEXORA IoT API", version = "1.0",
                description = "Cảm biến, điều khiển LED qua MQTT (ESP32), lịch sử, tài khoản"),
        security = @SecurityRequirement(name = "bearer"))
@SecurityScheme(name = "bearer", type = SecuritySchemeType.HTTP, scheme = "bearer", bearerFormat = "JWT")
public class OpenApiConfig {

    /** Document the JSON exactly as sent (snake_case keys from the app's ObjectMapper). */
    @Bean
    ModelResolver modelResolver(ObjectMapper objectMapper) {
        return new ModelResolver(objectMapper);
    }
}
