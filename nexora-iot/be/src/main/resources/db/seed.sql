-- NEXORA IoT — base seed (idempotent): demo user + sensor/device catalogs.
-- Demo credential (sanctioned): admin / admin123 (BCrypt cost 10 below).
-- Re-running keeps user edits (profile/password); catalogs are re-asserted.
-- Convention: ledN <-> devices.id N; sensors 1 temp, 2 humid, 3 light.

USE nexora;
SET NAMES utf8mb4;

INSERT INTO users (id, username, password, fullname, email, avatar_url, github_url, figma_url,
                   postman_url, docs_url, bio)
VALUES (1, 'admin', '$2a$10$zgu6ktPfmfQS/hiFwAWRWeGQh4gpB0ZfOAmt1wJk5vw9eUJfVObH2',
        'Trần Khắc Long', 'trankhaclong285@gmail.com', '', 'https://github.com/longtranddev2', '',
        '', 'https://github.com/longtranddev2/nexora-iot/tree/main/docs',
        'Sinh viên Học viện Công nghệ Bưu chính Viễn thông.')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO sensors (id, name, unit)
VALUES (1, 'Nhiệt độ', '°C'),
       (2, 'Độ ẩm', '%'),
       (3, 'Ánh sáng', '%')
ON DUPLICATE KEY UPDATE name = VALUES(name), unit = VALUES(unit);

INSERT INTO devices (id, name, status)
VALUES (1, 'LED 1', 'off'),
       (2, 'LED 2', 'off'),
       (3, 'LED 3', 'off')
ON DUPLICATE KEY UPDATE name = VALUES(name);
