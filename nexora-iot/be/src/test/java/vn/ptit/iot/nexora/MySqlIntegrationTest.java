package vn.ptit.iot.nexora;

import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.jdbc.core.JdbcTemplate;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.utility.MountableFile;

/**
 * Base for tests that need the REAL schema + MySQL semantics (DATE_FORMAT, CAST(double AS CHAR),
 * ENUM columns). One container per JVM (singleton pattern), schema.sql + seed.sql applied at
 * start; each test starts from base seed only.
 */
@SpringBootTest(properties = {
        // Inline so a developer's application-local.yml can never point tests at a real broker/DB.
        "mqtt.enabled=false",
        "device.control-timeout-ms=1500",
        "jwt.secret=test-secret-for-junit-only-0123456789abcdef"
})
public abstract class MySqlIntegrationTest {

    @ServiceConnection
    static final MySQLContainer<?> MYSQL = new MySQLContainer<>("mysql:8.0")
            .withDatabaseName("nexora")
            .withEnv("TZ", "Asia/Ho_Chi_Minh")
            .withCommand("--character-set-server=utf8mb4", "--collation-server=utf8mb4_unicode_ci")
            .withCopyFileToContainer(MountableFile.forClasspathResource("db/schema.sql"),
                    "/docker-entrypoint-initdb.d/1-schema.sql")
            .withCopyFileToContainer(MountableFile.forClasspathResource("db/seed.sql"),
                    "/docker-entrypoint-initdb.d/2-seed.sql");

    static {
        MYSQL.start();
    }

    @Autowired
    protected JdbcTemplate jdbc;

    @BeforeEach
    void resetToBaseSeed() {
        jdbc.update("DELETE FROM actions");
        jdbc.update("DELETE FROM data_sensors");
        jdbc.update("UPDATE devices SET status = 'off', updated_at = NULL");
        jdbc.update("UPDATE users SET username = 'admin', fullname = 'Trần Khắc Long', bio = '', avatar_url = ''"
                + " WHERE id = 1");
    }

    protected void insertReading(int sensorId, double value, String time) {
        jdbc.update("INSERT INTO data_sensors (sensor_id, value, time) VALUES (?, ?, ?)", sensorId, value, time);
    }

    protected void insertAction(int deviceId, String action, String status, String time) {
        jdbc.update("INSERT INTO actions (device_id, user_id, action, status, time) VALUES (?, 1, ?, ?, ?)",
                deviceId, action, status, time);
    }
}
