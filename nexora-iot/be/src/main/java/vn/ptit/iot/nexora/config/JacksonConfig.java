package vn.ptit.iot.nexora.config;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * JSON contract with the FE (`fe/src/types/iot.ts`): snake_case keys and every time as
 * local "yyyy-MM-dd HH:mm:ss" (no timezone conversion — laptop demo, FE parses as local).
 */
@Configuration
public class JacksonConfig {

    public static final String DATE_TIME_PATTERN = "yyyy-MM-dd HH:mm:ss";
    public static final DateTimeFormatter DATE_TIME_FORMAT = DateTimeFormatter.ofPattern(DATE_TIME_PATTERN);

    @Bean
    public Jackson2ObjectMapperBuilderCustomizer nexoraJsonCustomizer() {
        return builder -> builder
                .propertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE)
                .serializers(new LocalDateTimeSerializer(DATE_TIME_FORMAT))
                .deserializers(new LocalDateTimeDeserializer(DATE_TIME_FORMAT));
    }

    /** Formats a nullable time the way the FE expects ("" when absent). */
    public static String format(LocalDateTime time) {
        return time == null ? "" : time.format(DATE_TIME_FORMAT);
    }
}
