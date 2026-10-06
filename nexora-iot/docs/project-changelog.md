# Project Changelog — NEXORA IoT

## v1.0.0-rc — 2026-10-06 (PR `feat/backend-and-database`)

Backend + database + MQTT bridge to the ESP32, and the FE wired to it. The FE contract
(`fe/src/types/iot.ts`, `fe/src/services/iot-api.ts`) is unchanged; the mock adapter is removed.

### Added — backend (`be/`, Spring Boot 3.5.7, Java 17)
- REST API `/api/v1`: health; auth (login by username OR email, me, profile E-4, password E-5,
  logout); sensors (catalog, latest per sensor, history search); dashboard chart; devices
  (list, control incl. bulk E-1, history with `user_name` E-2).
- JWT HS256 (24h, secret ≥ 32 bytes or the app refuses to start), BCrypt passwords.
- Error envelope `{"error": "<Vietnamese message>"}`:
  400 validation / E3 "Thiết bị đang có lệnh đang xử lý", 401 "Chưa đăng nhập" (no token) vs
  "Phiên đăng nhập đã hết hạn" (bad token), 404, 409 username taken, 415, 503 broker down,
  504 "Thiết bị không phản hồi".
- History search: value PREFIX (`CAST(value AS CHAR)`), time contains in 3 display formats,
  `search_kind` all|temp|humid|light|time, inclusive from/to, `{items,page,limit,total}`.
- MQTT bridge to `iot-bai2-mqtt/esp32-mqtt-node` (Paho ↔ Mosquitto :2005, own 5 s reconnect loop):
  - `sensor_data` `{temp:29.50C,humid:60%,light:45%}` → 3 rows per tick (humid `-1` kept) → `/topic/sensors`.
  - Control publishes `{ledN:on|off}` (LED 1..3) or `{all:on|off}`; waits ≤ 30 s for a `device_response`
    echo whose state matches the target (stale echoes ignored); timeout reverts + 504.
  - `{}` sent on every broker connect and when `sensor_data` resumes after > 10 s silence (ESP32
    reboot) → firmware echoes its LED state → DB re-synced to the breadboard.
- STOMP over WebSocket `/ws`: `/topic/sensors`, `/topic/devices`; client SEND to `/topic` rejected.

### Added — database (`be/src/main/resources/db/`)
- `schema.sql`: users, sensors, devices, data_sensors, actions + indexes (deltas vs spec ERD in
  `db-schema-notes.md`; `users.avatar_url` is MEDIUMTEXT for uploaded data: URL avatars).
- `seed.sql`: admin/admin123 + sensor catalog + LED 1..3 (idempotent). No fake history.

### Changed — frontend
- `HttpIotApi` (`fe/src/services/http/`): REST via axios (Bearer token, `ApiError` mapping,
  401 → /login), STOMP hub with polling fallback (sensors 2 s, devices 10 s) and a catch-up poll on reconnect.
- The app always uses the backend: `MockIotApi` / in-browser simulator and `VITE_API_MODE` removed.
- Vite dev proxy for `/api` and `/ws` (`BE_URL`, default `http://localhost:8080`), `.env.example`.

### Added — tooling & docs
- 36 JUnit tests on Testcontainers MySQL 8.0 (parser, auth API, sensor/device search, control loop).
- Postman collection `docs/postman/nexora-api.postman_collection.json`.
- Docs: `system-architecture.md`, `runbook-demo.md`, `development-roadmap.md`, `db-schema-notes.md`.

### Known limits
See "Known Limits" in `db-schema-notes.md`. Verified with an ESP32 simulator; run-through with the
physical board pending.
