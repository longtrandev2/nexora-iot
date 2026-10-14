package vn.ptit.iot.nexora.config;

import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import vn.ptit.iot.nexora.entity.Device;
import vn.ptit.iot.nexora.entity.Sensor;
import vn.ptit.iot.nexora.entity.User;
import vn.ptit.iot.nexora.repository.DeviceRepository;
import vn.ptit.iot.nexora.repository.SensorRepository;
import vn.ptit.iot.nexora.repository.UserRepository;

/**
 * Creates the starting data on an empty DB (runs at every start, inserts only what is missing):
 * account admin / admin123, the 4 sensors and LED 1..3 (id N = ledN on the ESP32).
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository users;
    private final SensorRepository sensors;
    private final DeviceRepository devices;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository users, SensorRepository sensors, DeviceRepository devices,
                      PasswordEncoder passwordEncoder) {
        this.users = users;
        this.sensors = sensors;
        this.devices = devices;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (users.count() == 0) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setFullname("Trần Khắc Long");
            admin.setEmail("trankhaclong285@gmail.com");
            admin.setGithubUrl("https://github.com/longtranddev2");
            admin.setDocsUrl("https://github.com/longtranddev2/nexora-iot/tree/main/docs");
            admin.setBio("Sinh viên Học viện Công nghệ Bưu chính Viễn thông.");
            users.save(admin);
        }
        for (Sensor s : List.of(
                new Sensor(Sensor.TEMPERATURE, "Nhiệt độ", "°C"),
                new Sensor(Sensor.HUMIDITY, "Độ ẩm", "%"),
                new Sensor(Sensor.LIGHT, "Ánh sáng", "%"),
                new Sensor(Sensor.RAIN, "Độ mưa", "%"))) {   // added later: existing DBs get it on next start
            if (!sensors.existsById(s.getId())) sensors.save(s);
        }
        for (int id = 1; id <= 3; id++) {
            if (!devices.existsById(id)) devices.save(new Device(id, "LED " + id));
        }
    }
}
