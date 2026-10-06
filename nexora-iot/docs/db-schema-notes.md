# DB Schema Notes — Implementation vs Spec ERD

Source of truth: `be/src/main/resources/db/schema.sql` (MySQL 8+, utf8mb4).
Seed: `seed.sql` (admin + sensor catalog + LED 1..3, idempotent). No fake history — logs come from the ESP32.

## Table / column deltas

| Spec ERD | Implementation | Reason |
|---|---|---|
| `devicess` | `devices` | Clean name (locked 2026-09-23) |
| `data_sensorss` | `data_sensors` | Clean name |
| `action` | `actions` | Clean name; avoids reserved-word quoting |
| `data_sensorss.sensors_id` | `data_sensors.sensor_id` | Singular FK columns; JSON still emits `sensors_id` |
| `action.devices_id` | `actions.device_id` | Same; JSON emits `devices_id` |
| `users.name` / `description` | `users.fullname` / `bio` | FE `User` contract |
| `users.student_id` | dropped | `username` doubles as mã SV (editable in profile) |
| — | `users.avatar_url` (MEDIUMTEXT) | FE profile avatar uploaded as `data:image/...;base64,` (≤ 2MB file); also accepts empty or an http(s) URL; max 3M chars |
| — | `users.github_url, figma_url, postman_url, docs_url` (VARCHAR 255) | FE profile links (E-4), must be empty or valid http(s) URL |
| — | `sensors.unit` | FE `SensorInfo.unit` |
| — | `devices.status ENUM(on,off,loading)`, `devices.updated_at` | FE `Device` |
| `action.status ENUM(on,off,loading)` | `actions.status ENUM(success,failed,loading)` | FE `ActionStatus` — result of the command, not LED state |

## Data conventions
- `ledN` (MQTT) ↔ `devices.id = N`; sensors `1` Nhiệt độ °C, `2` Độ ẩm %, `3` Ánh sáng %.
- `value = -1` rows are stored (DHT11 absent marker); FE shows "Không có dữ liệu".
- All times are `DATETIME`, local server time, serialized `yyyy-MM-dd HH:mm:ss`. No TZ conversion anywhere.
- Ingest writes ~3 rows / 2s (~130k rows/day). No retention job; `TRUNCATE data_sensors` between demo days if wanted.

## Search SQL (matches what the FE displays)
- Value prefix: `CAST(value AS CHAR) LIKE 'needle%'`. MySQL prints DOUBLE the way the FE shows it
  (`25.1`, `60`, `-1`), so "25" matches 25.1 / 25.23 but not 2.25.
- Time contains: needle is a substring of ANY of `DATE_FORMAT(time, '%Y-%m-%d %H:%i:%s')`,
  `'%H:%i:%s %d/%m/%Y'` (the table display format), `'%Y/%m/%d %H:%i:%s'`.
- `search_kind=all` also matches sensor name contains and id contains. Name match uses the
  column collation (`utf8mb4_unicode_ci`: case + accent insensitive).
- `%`, `_`, `\` in the needle are escaped (literal match, like JS `includes`).
- Latest data per sensor uses one indexed `ORDER BY time DESC, id DESC LIMIT n` per sensor
  (instead of a full-table window function) — stays fast as the log grows.

## Indexes
- `data_sensors (sensor_id, time, id)`: per-sensor latest/chart/history scans.
- `data_sensors (time)`: unfiltered history ordered by time.
- `actions (device_id, time, id)`, `(user_id)`, `(time)`: device history filters.

## Migration Notes

**Upgrading from older schema (avatar_url as VARCHAR 255):**
If your DB was created from an earlier schema, `users.avatar_url` is VARCHAR(255) and avatar data: URL uploads will fail with 400 (too long). Upgrade:
```sql
ALTER TABLE users MODIFY avatar_url MEDIUMTEXT NOT NULL;
```
No schema.sql change needed; `CREATE TABLE IF NOT EXISTS` preserves existing table structure.

## Known Limits

Accepted trade-offs for a single-user laptop demo:
- **History search performance**: per-page `COUNT(*)`, `OFFSET` paging and `DATE_FORMAT` contains
  searches scan more rows as the log grows (~130k rows/day). `TRUNCATE data_sensors` between demo days.
- **Name search**: `utf8mb4_unicode_ci` is case + accent insensitive ("nhiet" matches "Nhiệt độ").
- **JWT is stateless**: logout / password change do not revoke issued tokens (valid until 24h expiry);
  the FE drops its token on logout. No login rate limit.
- **`/ws` is unauthenticated** but read-only: clients can subscribe to `/topic/*`; STOMP SEND to
  `/topic/*` is rejected by `WebSocketConfig`.
- **Device control blocks the request thread** for up to 30 s while waiting for the ESP32 echo.
- **Timezones**: every displayed time (readings, actions, `updated_at`) is written by the backend from
  the JVM's local clock and shown by the FE as local time — run backend and browser on the same laptop
  timezone (Asia/Ho_Chi_Minh). Don't move only one side to UTC.
- **Avatar**: stored inline as a data: URL in `users.avatar_url` (server caps it at 3M chars); it is
  returned in every `/auth/me` / login response, so keep uploads small.
