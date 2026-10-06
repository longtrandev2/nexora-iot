# NEXORA IoT

Hệ thống giám sát và điều khiển IoT cho phòng thí nghiệm (đồ án môn IoT, PTIT): 3 cảm biến (nhiệt độ, độ ẩm, ánh sáng) + 3 đèn LED, giao tiếp MQTT qua ESP32.

## Repository Layout

```
nexora-iot/
├── docs/         # Specification, architecture, runbook, Postman collection
├── fe/           # Vite + React + TypeScript + Tailwind CSS 3.4 (dashboard web app)
└── be/           # Spring Boot 3.5.7 + MySQL + MQTT + WebSocket (backend + API)
../iot-bai2-mqtt/ # ESP32 firmware + Mosquitto setup (sibling folder, frozen)
```

## Quick Start

**Prerequisite**: MySQL 8+, JDK 17+, Maven 3.9+, Node 20+, Mosquitto broker (port 2005).
Full step-by-step (DB setup, pre-flight, demo script): `docs/runbook-demo.md`.

### Backend (be/)

```bash
cd be
# Config: copy application-example.yml → application-local.yml (gitignored): MySQL user/password,
# MQTT host/password, jwt.secret (>= 32 chars). Hibernate creates the DB + tables, DataSeeder the admin.
mvn -DskipTests package
java -jar target/nexora-be-1.0.0.jar   # http://localhost:8080/api/v1/health → {"status":"up"}
mvn test                               # MQTT payload parser unit tests (no DB needed)
```
Don't use `mvn spring-boot:run` in a folder with Vietnamese characters (Windows breaks the classpath).
Full backend guide (Vietnamese): `docs/backend-readme.md`.

### Frontend (fe/)

```bash
cd fe
npm install
npm run dev      # http://localhost:5173 (proxies /api, /ws to the backend on :8080)
npm run build    # tsc + vite build
```

Stack: Vite, React 19, TypeScript (strict), Tailwind CSS 3.4, recharts. UI tiếng Việt (Stitch tokens). Data layer: `IotApi` interface implemented by `HttpIotApi` (REST + STOMP) — all data comes from the backend / ESP32, there is no mock mode.

### MQTT Setup (demo only)

See `../iot-bai2-mqtt/README.md` for Mosquitto config + ESP32 firmware. TL;DR:
- Laptop runs Mosquitto on port 2005 (Windows service configured per that README §4.2) with auth user `TranKhacLong`
- ESP32 (iot-bai2-mqtt) publishes sensor data, listens for device control commands
- BE bridges MQTT → REST/WebSocket for FE

## Docs

- `docs/backend-readme.md` — khởi động, cấu trúc BE từng file, FE ↔ BE, MQTT ↔ BE (tiếng Việt)
- `docs/system-architecture.md` — system design, component interactions
- `docs/db-schema-notes.md` — schema, data conventions, search patterns
- `docs/runbook-demo.md` — step-by-step demo setup & verification
- `docs/development-roadmap.md` — phases, status, next steps
- `docs/project-changelog.md` — releases, v1.0.0-rc status
- `docs/bao-cao-iot-spec.md` — original system specification (source of truth for API/DB)
- `docs/design-tokens.md` — design tokens from Stitch reference
