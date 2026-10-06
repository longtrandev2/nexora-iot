# Demo Runbook — NEXORA IoT

Boot order: **MySQL → Mosquitto → ESP32 → Backend → Frontend**. Run shell commands from
**Git Bash** (on Windows, Maven crashes when the Vietnamese project path is passed as an argument
from PowerShell — always `cd` into the folder first).

## Prerequisites (once)
- MySQL 8+ (local service), JDK 17+, Maven 3.9+, Node 20+, Mosquitto (setup in `../iot-bai2-mqtt/README.md`)
- ESP32 flashed with `iot-bai2-mqtt/esp32-mqtt-node` (its `MQTT_HOST` = laptop IP, same 2.4 GHz WiFi)

## 1. Database
Nothing to run by hand: on startup the backend (Hibernate `ddl-auto: update`) creates database
`nexora` and its 5 tables, and `DataSeeder` adds admin/admin123, the 3 sensors and LED 1..3.
It only needs a MySQL user that may create a database (e.g. `root`) in `be/.env`.
No fake history: every reading and action comes from the real ESP32.
- Times are written by the backend from the laptop clock (local time, Asia/Ho_Chi_Minh) — keep
  backend and browser on the same machine/timezone.
- DB created from an older schema? `ALTER TABLE users MODIFY avatar_url MEDIUMTEXT NOT NULL;`
  (otherwise avatar uploads fail with 400).

## 2. Pre-flight (every demo day)
1. `ipconfig` → note the laptop IPv4 (DHCP, e.g. `172.20.10.2`).
2. Broker on 2005 with user `TranKhacLong`: run `start-mosquitto-broker.bat` from a copy of
   `iot-bai2-mqtt` in a path without Vietnamese characters (e.g. `D:\Project\IOT\iot-bai2-mqtt` —
   mosquitto.exe can't read accented paths), with the Mosquitto Windows service stopped.
   Don't run `setup-mosquitto-admin.bat` (old script: port 1888, overwrites the password file).
3. Power the ESP32; Serial monitor should show `[MQTT] Ket noi OK`.
4. Optional check: `mosquitto_sub -h <IP> -p 2005 -u TranKhacLong -P YOUR_MQTT_PASSWORD -t sensor_data -v`
   → one line every 2 s.

## 3. Backend
```bash
cd nexora-iot/be
cp .env.example .env     # gitignored; fill DB_PASSWORD, MQTT_PASSWORD, JWT_SECRET (>= 32 chars)
                         # MQTT_HOST stays localhost (the broker runs on this laptop)
mvn -DskipTests package && java -jar target/nexora-be-1.0.0.jar   # not spring-boot:run (accented path)
```
- Wait for `Started NexoraApplication` and `MQTT connected to tcp://<IP>:2005`.
- `curl http://localhost:8080/api/v1/health` → `{"status":"up"}`.
- Env vars work instead of the yml: `DB_PASSWORD`, `MQTT_HOST`, `MQTT_PASSWORD`, `JWT_SECRET`, …
  (full list in `src/main/resources/application.yml`).
- The backend sends `{}` when it connects to the broker; the ESP32 answers with its LED state, so the
  device cards start in sync with the breadboard. Its `device_response` after any command also syncs them.

## 4. Frontend
```bash
cd nexora-iot/fe
npm install
npm run dev                           # http://localhost:5173 (proxies /api and /ws to :8080)
```
Log in with **admin / admin123**.

## 5. Demo script (spec use cases)
| UC | Action | Expected |
|---|---|---|
| UC01 | Wrong password, then admin/admin123; refresh; logout | Toast "Sai tên đăng nhập hoặc mật khẩu"; session kept on refresh |
| UC02 | Watch dashboard; cover the LDR | Cards + chart update every ~2 s; light drops; humidity shows "Không có dữ liệu" while DHT11 is absent (`-1`) |
| UC03 | Toggle each LED, then "BẬT/TẮT TẤT CẢ" | Physical LED follows, card confirms in < 1 s; second click on a busy LED is blocked |
| UC03-E1 | Unplug the ESP32, toggle a LED | After 30 s toast "Thiết bị không phản hồi", LED reverts, history row "Thất bại" |
| UC04 | Lịch sử cảm biến: filter sensor + range, search `25` (Nhiệt độ), paginate | Prefix matches (25.1, 25.23 — not 2.25) |
| UC05 | Lịch sử bật/tắt: filter status, search `2026/10` | User column "Trần Khắc Long" |
| E-4/E-5 | Edit bio + avatar, change password, log in again | Saved; new password works |

## Troubleshooting
| Symptom | Cause / fix |
|---|---|
| Backend exits: `jwt.secret must be at least 32 bytes` | Set `JWT_SECRET` / `jwt.secret` (≥ 32 chars) |
| Backend exits: `Access denied for user` | Wrong `DB_USERNAME`/`DB_PASSWORD` in `be/.env` |
| Log repeats `MQTT connect ... failed, retry in 5s` | Broker not running, wrong `MQTT_HOST` (IP changed), password, or firewall rule for 2005 |
| Toggle → "Không kết nối được MQTT broker" (503) | Backend not connected to the broker (see above) |
| Toggle → "Thiết bị không phản hồi" (504) after 30 s | Broker OK but ESP32 offline / on another WiFi / wrong `MQTT_HOST` in firmware |
| Dashboard frozen, no errors | ESP32 not publishing; check the `mosquitto_sub` line in step 2 |
| Times shifted by hours | Backend JVM runs in another timezone than the browser (e.g. `-Duser.timezone=UTC`) |
| `ClassNotFoundException ... NexoraApplication` | Run `java -jar target/nexora-be-1.0.0.jar`, not `mvn spring-boot:run` |

## After the demo
The `data_sensors` table grows ~130k rows/day while the ESP32 runs. To start fresh: `TRUNCATE data_sensors;`
(and `TRUNCATE actions;` for the on/off log).

API checks without the UI: import `docs/postman/nexora-api.postman_collection.json`, run "Auth / Login" first.
