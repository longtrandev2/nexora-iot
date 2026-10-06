# Demo Runbook — NEXORA IoT

Boot order: **MySQL → Mosquitto → ESP32 → Backend → Frontend**. Run shell commands from
**Git Bash** (on Windows, Maven crashes when the Vietnamese project path is passed as an argument
from PowerShell — always `cd` into the folder first).

## Prerequisites (once)
- MySQL 8+ (local service), JDK 17+, Maven 3.9+, Node 20+, Mosquitto (setup in `../iot-bai2-mqtt/README.md`)
- ESP32 flashed with `iot-bai2-mqtt/esp32-mqtt-node` (its `MQTT_HOST` = laptop IP, same 2.4 GHz WiFi)
- Docker Desktop only if you want to run `mvn test` (Testcontainers)

## 1. Database (once, or to reset)
```sql
-- mysql -u root -p
CREATE USER IF NOT EXISTS 'nexora'@'localhost' IDENTIFIED BY 'YOUR_DB_PASSWORD';
GRANT ALL PRIVILEGES ON nexora.* TO 'nexora'@'localhost';
```
```bash
cd nexora-iot/be/src/main/resources/db
mysql -u root -p < schema.sql             # creates DB `nexora` + 5 tables
mysql -u root -p < seed.sql               # admin/admin123, sensors, LED 1..3 (idempotent)
```
No fake history is seeded: every reading and action comes from the real ESP32.
- Times are written by the backend from the laptop clock (local time, Asia/Ho_Chi_Minh) — keep
  backend and browser on the same machine/timezone.
- DB created from an older schema? `ALTER TABLE users MODIFY avatar_url MEDIUMTEXT NOT NULL;`
  (otherwise avatar uploads fail with 400).

## 2. Pre-flight (every demo day)
1. `ipconfig` → note the laptop IPv4 (DHCP, e.g. `172.20.10.2`).
2. Broker running on 2005 with user `TranKhacLong`: the Mosquitto Windows service configured per
   `iot-bai2-mqtt/README.md` §4.2 (`Get-Service mosquitto` → Running). Note: `start-mosquitto-broker.bat`
   points at an old path (`D:\Project\IOT\...\mosquitto.conf`) and would also clash with the service on
   port 2005; `setup-mosquitto-admin.bat` is an old script for port 1888 that overwrites the password
   file with another user — don't run it.
3. Power the ESP32; Serial monitor should show `[MQTT] Ket noi OK`.
4. Optional check: `mosquitto_sub -h <IP> -p 2005 -u TranKhacLong -P YOUR_MQTT_PASSWORD -t sensor_data -v`
   → one line every 2 s.

## 3. Backend
```bash
cd nexora-iot/be
cp application-example.yml application-local.yml   # gitignored; fill DB/MQTT passwords,
                                                    # mqtt.host = IP from step 2, jwt.secret >= 32 chars
mvn spring-boot:run                                 # or: mvn -DskipTests package && java -jar target/nexora-be-1.0.0.jar
```
- Wait for `Started NexoraApplication` and `MQTT connected to tcp://<IP>:2005`.
- `curl http://localhost:8080/api/v1/health` → `{"status":"up"}`.
- Env vars work instead of the yml: `DB_PASSWORD`, `MQTT_HOST`, `MQTT_PASSWORD`, `JWT_SECRET`, …
  (full list in `src/main/resources/application.yml`).
- The backend sends `{}` on every MQTT connect and whenever the ESP32's `sensor_data` resumes after
  > 10 s of silence (power cycle / reboot); the ESP32 answers with its LED state, so the device cards
  stay in sync with the breadboard (after a reboot all 3 LEDs are off).

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
| Backend exits on schema validation | Re-apply `schema.sql` on a fresh `nexora` DB |
| Log repeats `MQTT connect ... failed, retry in 5s` | Broker not running, wrong `MQTT_HOST` (IP changed), password, or firewall rule for 2005 |
| Toggle → "Không kết nối được MQTT broker" (503) | Backend not connected to the broker (see above) |
| Toggle → "Thiết bị không phản hồi" (504) after 30 s | Broker OK but ESP32 offline / on another WiFi / wrong `MQTT_HOST` in firmware |
| Dashboard frozen, no errors | ESP32 not publishing; check the `mosquitto_sub` line in step 2 |
| Times shifted by hours | Backend JVM runs in another timezone than the browser (e.g. `-Duser.timezone=UTC`) |
| `mvn test` fails at startup | Docker Desktop not running (tests use Testcontainers MySQL) |

## After the demo
The `data_sensors` table grows ~130k rows/day while the ESP32 runs. To start fresh: `TRUNCATE data_sensors;`
(and `TRUNCATE actions;` for the on/off log).

API checks without the UI: import `docs/postman/nexora-api.postman_collection.json`, run "Auth / Login" first.
