# System Architecture — NEXORA IoT

IoT laboratory monitoring system: 3 sensors (temperature, humidity, light) + 3 LED controls via ESP32, MQTT broker, Spring Boot REST/WebSocket API, React dashboard.

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         NEXORA IoT                              │
└─────────────────────────────────────────────────────────────────┘

[ESP32 + Hardware]
  • 3 LED: GPIO 12, 14, 27
  • LM35 (temp): GPIO 33, 0–50°C
  • LDR (light): GPIO 32, 0–100%
  • DHT11 (humid): GPIO 13, 0–100% or -1
  • Firmware: iot-bai2-mqtt/esp32-mqtt-node.ino
       │
       │ WiFi + MQTT (port 2005)
       ▼
[Mosquitto Broker]  (DHCP laptop IP, e.g., 172.20.10.2)
  • Topic: sensor_data (pub by ESP32 every 2s)
  • Topic: device_control (sub by ESP32)
  • Topic: device_response (pub by ESP32, ack of control)
       │
       │ MQTT client
       ▼
[Spring Boot Backend] (Java 17, port 8080)
  ├─ REST API /api/v1/* (JSON)
  ├─ WebSocket /ws (STOMP)
  └─ MySQL 8+ (JDBC)
       │
       ├─ REST proxy to FE
       ├─ MQTT → WebSocket bridge (/topic/sensors, /topic/devices)
       ├─ Device control flow (UC03: validate → E3 check → publish → await echo → update DB)
       └─ Sensor data ingest (3 rows/2s, DHT11 absence marker -1 kept)
       │
       ▼
[MySQL Database]
  • users (auth + profile)
  • sensors (catalog: temp, humid, light)
  • devices (LED 1, 2, 3 + status)
  • data_sensors (ingest log, ~130k rows/day)
  • actions (control history, result status)
       │
       ▼
[React Frontend] (Vite, port 5173)
  • Login (username OR email)
  • Dashboard: live sensor charts, device status
  • Sensor History: search by time/value/name
  • Device History: search by action result (success/failed/loading)
  • Profile: avatar (data: URL), links
  • Toggle LED via WebSocket or polling fallback
```

## Data Flow Patterns

### Sensor Ingest (Real-time)
```
ESP32 → pub "sensor_data" {temp, humid, light} (every 2s)
  ↓
Mosquitto (broker)
  ↓
MqttService (Paho) → Spring event MqttService.Message
  ↓
SensorService.onSensorData: parse payload
  ↓
INSERT INTO data_sensors (sensor_id, time, value)
  ↓
Publish /topic/sensors [SensorReading[]...] over WebSocket (aggregated every 2s tick)
  ↓
React FE: recharts line chart updates, polling fallback after 5s WS lag
```

### Device Control (UC03 — Control Loop)
```
React FE: user clicks LED toggle → POST /api/v1/devices/control
  ↓
DeviceService.control
  ├─ Validate device exists
  ├─ Check E3 in-flight lock per device (400 if "Đang xử lý")
  └─ Mark action 'loading', device 'loading'
  ↓
Publish MQTT "device_control" {ledN:on|off} (only the target LED) or {all:on|off}
  ↓
Publish /topic/devices to FE (optimistic state)
  ↓
Wait for MQTT "device_response" (≤30s, DeviceService.onDeviceResponse completes the wait)
  ├─ On echo arrival: match state == target
  │  ├─ YES → mark action 'success', update device state, broadcast /topic/devices
  │  └─ NO → ignore (stale echo from earlier command)
  └─ On timeout → mark action 'failed', revert device state, broadcast /topic/devices, return 504
  ↓
React FE: action row status updates, LED toggle completes (or reverts on timeout)
```

### LED State Sync (no correlation id in the firmware)
```
BE publishes "{}" to device_control when it (re)connects to the broker.
ESP32 matches no command in "{}" → re-publishes device_response {led1:..,led2:..,led3:..}
BE: devices with no command in flight → devices.status updated if different → push /topic/devices
```

### WebSocket Fallback
```
FE connects to /ws (STOMP, auto-reconnect 5s) → subscribe /topic/sensors, /topic/devices
  ├─ Connected: live pushes only (sensors every ~2s tick, devices on every transition)
  └─ Not connected after a 5s grace: poll GET /sensors/data?limit=1 every 2s
     (new ids only) and GET /devices every 10s; polling stops once the socket is back
On reconnect: one catch-up poll fills pushes missed while offline
```

## Component Breakdown

### Backend Packages

| Package | Role |
|---------|------|
| `entity` | JPA User, Sensor, Device, DataSensor, DeviceAction — Hibernate creates the tables |
| `repository` | Spring Data JPA (3 hand-written JPQL queries for chart/history search) |
| `dto` | `ApiDto`: every JSON body (records) + paging |
| `service` | AuthService, SensorService, DeviceService (control loop), ApiException |
| `mqtt` | MqttService (connect/reconnect, publish, events), MqttPayloadParser |
| `controller` | AuthController (+health), SensorController (+chart), DeviceController, ApiExceptionHandler |
| `security` | JwtService (HS256, 24h), SecurityConfig (Bearer filter, CORS, BCrypt) |
| `config` | WebSocketConfig (STOMP /ws), DataSeeder (admin, sensors, LED 1..3) |

File-by-file description: `backend-readme.md`.

### Database Schema

| Table | Rows | Indexes | Purpose |
|-------|------|---------|---------|
| users | 1 (admin) | pk(id), unique(username) | authentication, profile |
| sensors | 3 | pk(id) | catalog: temp, humid, light |
| devices | 3 | pk(id) | LED 1, 2, 3 state |
| data_sensors | ~130k/day | (sensor_id, time), (time) | ingest log |
| actions | 1 per command | (device_id, time), (time) | control history |

### Frontend Routes

| Path | Component | Data Source |
|------|-----------|-------------|
| `/login` | LoginPage | POST /auth/login (username OR email) |
| `/` | DashboardPage | GET /sensors/data, /dashboard/sensors/chart, /devices + WS /topic/sensors, /topic/devices |
| `/devices` | DeviceControlPage | GET /devices, POST /devices/control + WS /topic/devices |
| `/sensor-history` | SensorHistoryPage | GET /sensors, /sensors/history (paginated, searchable) |
| `/onoff-history` | OnoffHistoryPage | GET /devices/history (paginated, searchable) |
| `/profile` | ProfilePage | GET\|PUT /auth/me, PATCH /auth/password |

## Security Model

- **Auth**: JWT + BCrypt + CORS (localhost:5173 only)
- **API**: all endpoints except `/health`, `/auth/login`, `/auth/logout` require valid JWT
- **WebSocket**: `/ws` needs no login (dashboard feed on the laptop network)
- **MQTT**: Bridge internal (laptop network), auth via broker credentials (env var `MQTT_PASSWORD`)

## Constraints & Known Limits

- **Timezone**: times are written from the backend JVM's local clock; FE shows them as local time
- **JWT revocation**: no stateless revocation; token valid until expiry
- **Performance**: search full-scans as log grows; device control blocks 1 thread for up to 30s
- **MQTT echo matching**: no correlation ID; matches state value only
- **Rate limiting**: none (brute-force possible)
- **Avatar size**: data: URL limit ~2MB (MEDIUMTEXT storage)

See `db-schema-notes.md` → "Known limits" for detailed constraints.

## Verification Checklist

- [x] Unit tests: MQTT payload parser (incl. real-board payload `humid: 9%`)
- [x] Hibernate creates all tables + DataSeeder rows on an empty database
- [x] Physical ESP32 + breadboard: ingestion every 2s, LED 1..3 + all on/off confirmed in 0.26–0.37s, busy-LED block
- [x] FE in a real Chrome: login, dashboard live, LED toggle, histories, zero console/HTTP errors
- [ ] Run on the demo laptop's local MySQL (needs its credentials in `be/application-local.yml`)

Remaining work: `development-roadmap.md`.
