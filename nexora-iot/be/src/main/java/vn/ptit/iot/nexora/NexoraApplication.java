package vn.ptit.iot.nexora;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.scheduling.annotation.EnableScheduling;

/** REST API + WebSocket push + MQTT bridge to the ESP32. Auth is JWT only (no Spring default user). */
@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
@EnableScheduling
public class NexoraApplication {

    public static void main(String[] args) {
        SpringApplication.run(NexoraApplication.class, args);
    }
}
