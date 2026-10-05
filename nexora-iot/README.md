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
# DB once: mysql -u root -p < src/main/resources/db/schema.sql (then seed.sql, optional seed-demo.sql)
# Config: copy application-example.yml → application-local.yml (gitignored) and fill it,
# or export env vars DB_PASSWORD, MQTT_HOST, MQTT_PASSWORD, JWT_SECRET (>= 32 chars)
mvn spring-boot:run   # http://localhost:8080/api/v1/health → {"status":"up"}
mvn test              # 36 tests, needs Docker running (Testcontainers MySQL)
```
On Windows run Maven from Git Bash after `cd` (PowerShell + the Vietnamese path crashes Maven).

### Frontend (fe/)

```bash
cd fe
npm install
# Set VITE_API_MODE=http (or keep mock for UI-only dev)
npm run dev      # http://localhost:5173 (proxies /api, /ws to BE)
npm run build    # tsc + vite build
```

Stack: Vite, React 19, TypeScript (strict), Tailwind CSS 3.4, recharts. UI tiếng Việt (Stitch tokens). Data layer: `IotApi` interface with `MockIotApi` (default) / `HttpIotApi` (real backend).

### MQTT Setup (demo only)

See `../iot-bai2-mqtt/README.md` for Mosquitto config + ESP32 firmware. TL;DR:
- Laptop runs Mosquitto on port 2005 (`start-mosquitto-broker.bat`) with auth user `TranKhacLong`
- ESP32 (iot-bai2-mqtt) publishes sensor data, listens for device control commands
- BE bridges MQTT → REST/WebSocket for FE

## Docs

- `docs/system-architecture.md` — system design, component interactions
- `docs/db-schema-notes.md` — schema, data conventions, search patterns
- `docs/runbook-demo.md` — step-by-step demo setup & verification
- `docs/development-roadmap.md` — phases, status, next steps
- `docs/project-changelog.md` — releases, v1.0.0-rc status
- `docs/bao-cao-iot-spec.md` — original system specification (source of truth for API/DB)
- `docs/design-tokens.md` — design tokens from Stitch reference
