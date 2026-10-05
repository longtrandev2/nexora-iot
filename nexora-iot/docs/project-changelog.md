# Project Changelog — NEXORA IoT

## v1.0.0-rc — 2026-10-05 (branch `feat/backend-and-database`)

Backend + database + MQTT bridge, and the FE `HttpIotApi` adapter. The FE contract
(`fe/src/types/iot.ts`, `fe/src/services/iot-api.ts`) is unchanged.

### Added — backend (`be/`, Spring Boot 3.5.7, Java 17)
- REST API `/api/v1`: health; auth (login by username OR email, me, profile E-4, password E-5,
  logout); sensors (catalog, latest per sensor, history search); dashboard chart; devices
  (list, control incl. bulk E-1, history with `user_name` E-2).
- JWT HS256 (24h, secret ≥ 32 bytes or the app refuses to start), BCrypt passwords.
- Error envelope `{"error": "<Vietnamese message>"}` with mock-identical messages:
  400 validation / E3 "Thiết bị đang có lệnh đang xử lý", 401 "Chưa đăng nhập" (no token) vs
  "Phiên đăng nhập đã hết hạn" (bad token), 404, 409 username taken, 415, 503 broker down,
  504 "Thiết bị không phản hồi".
- History search with FE-mock parity: value PREFIX (`CAST(value AS CHAR)`), time contains in 3
  display formats, `search_kind` all|temp|humid|light|time, inclusive from/to, `{items,page,limit,total}`.
- MQTT bridge (Paho ↔ Mosquitto, own 5 s reconnect loop):
  - `sensor_data` `{temp:29.50C,humid:60%,light:45%}` → 3 rows per tick (humid `-1` kept) → `/topic/sensors`.
  - Control publishes `{ledN:on|off}` or `{all:on|off}`; waits ≤ 30 s for a `device_response`
    echo whose state matches the target (stale echoes ignored); timeout reverts + 504.
  - `{}` published on every connect → firmware echoes full state → DB re-synced to hardware.
- STOMP over WebSocket `/ws`: `/topic/sensors`, `/topic/devices`; client SEND to `/topic` rejected.

### Added — database (`be/src/main/resources/db/`)
- `schema.sql`: users, sensors, devices, data_sensors, actions + indexes (deltas vs spec ERD in
  `db-schema-notes.md`; `users.avatar_url` is MEDIUMTEXT for uploaded data: URL avatars).
- `seed.sql`: admin/admin123 + sensor/device catalogs (idempotent).
- `seed-demo.sql`: resets logs; ~2000 rows/sensor (2 years sparse + last 24 h dense), 40 actions.

### Added — frontend (`fe/src/services/http/`)
- `HttpIotApi` (REST via axios, Bearer token, `ApiError` mapping, 401 → /login), STOMP hub with
  polling fallback (sensors 2 s, devices 10 s) and a catch-up poll on reconnect.
- `VITE_API_MODE=http` switch (mock stays default), Vite proxy for `/api` and `/ws`, `.env.example`.

### Added — tooling & docs
- 36 JUnit tests on Testcontainers MySQL 8.0 (parser, auth API, sensor/device search, control loop).
- Postman collection `docs/postman/nexora-api.postman_collection.json`.
- Docs: `system-architecture.md`, `runbook-demo.md`, `development-roadmap.md`, `db-schema-notes.md`.

### Known limits
See "Known Limits" in `db-schema-notes.md`. Physical-ESP32 E2E still pending (simulator-verified).
