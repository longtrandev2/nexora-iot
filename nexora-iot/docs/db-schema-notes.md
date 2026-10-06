# DB Schema Notes — Implementation vs Spec ERD

Source of truth: the JPA entities in `be/src/main/java/vn/ptit/iot/nexora/entity/`. Hibernate
(`ddl-auto: update`) creates database `nexora` and the tables on startup; `config/DataSeeder.java`
inserts admin/admin123, the 3 sensors and LED 1..3 when missing. No fake history — logs come from the ESP32.

## Table / column deltas

| Spec ERD | Implementation | Reason |
|---|---|---|
| `devicess` | `devices` | Clean name (locked 2026-09-23) |
| `data_sensorss` | `data_sensors` | Clean name |
| `action` | `actions` | Clean name; avoids reserved-word quoting |
| `data_sensorss.sensors_id` | `data_sensors.sensor_id` | Singular columns; JSON still emits `sensors_id` |
| `action.devices_id` | `actions.device_id` | Same; JSON emits `devices_id` |
| `users.name` / `description` | `users.fullname` / `bio` | FE `User` contract |
| `users.student_id` | dropped | `username` doubles as mã SV (editable in profile) |
| — | `users.avatar_url` (MEDIUMTEXT) | FE uploads the avatar as a `data:image/...;base64,` URL (≤ 2MB file) |
| — | `users.github_url, figma_url, postman_url, docs_url` | FE profile links (E-4) |
| — | `sensors.unit` | FE `SensorInfo.unit` |
| — | `devices.status ENUM(on,off,loading)`, `devices.updated_at` | FE `Device` |
| `action.status ENUM(on,off,loading)` | `actions.status ENUM(success,failed,loading)` | FE `ActionStatus` — result of the command, not LED state |

## Data conventions
- `ledN` (MQTT) ↔ `devices.id = N`; sensors `1` Nhiệt độ °C, `2` Độ ẩm %, `3` Ánh sáng % (fixed ids).
- `value = -1` rows are stored (DHT11 absent marker); FE shows "Không có dữ liệu".
- Times are `DATETIME` written from the backend's local clock, serialized `yyyy-MM-dd HH:mm:ss`.
- Ingest writes ~3 rows / 2s (~130k rows/day). `TRUNCATE data_sensors` between demo days if wanted.

## History search (JPQL in the repositories)
- Value prefix: `cast(value as String) like 'q%'` — MySQL prints DOUBLE like the FE (`25.1`, `60`, `-1`),
  so "25" matches 25.1 / 25.23 but not 2.25.
- Time contains: q is a substring of `DATE_FORMAT(time, ...)` in 3 formats — `%Y-%m-%d %H:%i:%s`,
  `%H:%i:%s %d/%m/%Y` (table display), `%Y/%m/%d %H:%i:%s`.
- `search_kind=all` also matches sensor name and id. Name match follows the DB collation
  (MySQL default `utf8mb4_0900_ai_ci`: case + accent insensitive).
- `%`, `_`, `\` in the search text are escaped (literal match).

## Indexes (declared on the entities)
- `data_sensors (sensor_id, time)`, `data_sensors (time)`
- `actions (device_id, time)`, `actions (time)`
- `users.username` unique

## Known limits (single-user laptop demo)
- History search: per-page `COUNT(*)`, `OFFSET` paging and `DATE_FORMAT` searches get slower as the log grows.
- JWT is stateless: logout / password change don't revoke issued tokens (24h expiry). No login rate limit.
- `/ws` needs no login (read-only dashboard feed on the laptop network).
- Device control blocks the request thread up to 30 s while waiting for the ESP32.
- Backend and browser must use the same timezone (Asia/Ho_Chi_Minh): times are local, no TZ conversion.
