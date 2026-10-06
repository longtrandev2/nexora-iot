# Backend NEXORA IoT — Khởi động, cấu trúc, FE ↔ BE, MQTT ↔ BE

Backend: `nexora-iot/be` (Spring Boot 3.5, Java 17, MySQL, MQTT, WebSocket). Hướng dẫn demo: `runbook-demo.md`.

```
[ESP32 + breadboard] ──MQTT:2005──► [Mosquitto] ◄──MQTT── [Spring Boot :8080] ──JPA/Hibernate──► [MySQL :3306]
                                                             ▲          │
                                              REST /api/v1   │          │ WebSocket STOMP /ws
                                                             │          ▼
                                                      [React FE :5173 (Vite proxy)]
```

---

## 1. Khởi động

**Lần đầu**
1. MySQL local đang chạy. Không cần tạo bảng: Hibernate tự tạo database `nexora` + 5 bảng,
   `DataSeeder` tự thêm admin / 3 cảm biến / LED 1..3.
2. Copy `be/.env.example` thành `be/.env` (không bị commit) rồi điền:
   `DB_PASSWORD` (MySQL root), `MQTT_PASSWORD`, `JWT_SECRET` (≥ 32 ký tự). Các dòng còn lại để mặc định:
   `DB_URL` = MySQL local 3306, `MQTT_HOST=localhost` (broker chạy trên chính laptop).
3. `cd nexora-iot\fe` → `npm install`.

**Mỗi lần chạy**
| Bước | Lệnh |
|---|---|
| 1. Broker | `D:\Project\IOT\iot-bai2-mqtt\start-mosquitto-broker.bat` (Mosquitto không đọc được đường dẫn có dấu) |
| 2. ESP32 | Cắm nguồn, Serial báo `[MQTT] Ket noi OK` |
| 3. Backend | `cd nexora-iot\be` → `mvn -DskipTests package` (khi có sửa code) → `java -jar target\nexora-be-1.0.0.jar` |
| 4. Frontend | `cd nexora-iot\fe` → `npm run dev` → http://localhost:5173, đăng nhập `admin` / `admin123` |

- Không dùng `mvn spring-boot:run` trong thư mục có dấu tiếng Việt (Windows làm hỏng classpath →
  `ClassNotFoundException`). Dùng `java -jar` như trên.
- Kiểm tra: http://localhost:8080/api/v1/health → `{"status":"up"}`; log có `MQTT connected to tcp://localhost:2005`.
- **Swagger UI**: http://localhost:8080/swagger-ui.html — gọi `POST /api/v1/auth/login`, copy `token`,
  bấm **Authorize**, dán token → thử mọi API. JSON OpenAPI: http://localhost:8080/v3/api-docs.
- Test: `mvn test` (unit test bộ đọc payload MQTT, không cần DB).

---

## 2. Cấu trúc backend

```
be/
├── pom.xml                       # Spring Boot web, data-jpa, security, websocket; MySQL driver; Paho MQTT; jjwt; Lombok
├── .env.example                  # Mẫu biến cấu hình (DB, MQTT, JWT)
├── .env                          # Giá trị thật của máy (gitignored)
└── src/
    ├── main/java/vn/ptit/iot/nexora/
    │   ├── NexoraApplication.java
    │   ├── entity/       User, Sensor, Device, DataSensor, DeviceAction      → bảng MySQL
    │   ├── repository/   5 interface Spring Data                              → truy vấn
    │   ├── dto/          ApiDto                                                → JSON vào/ra
    │   ├── service/      AuthService, SensorService, DeviceService, ApiException
    │   ├── mqtt/         MqttService, MqttPayloadParser                       → nói chuyện với ESP32
    │   ├── controller/   AuthController, SensorController, DeviceController, ApiExceptionHandler
    │   ├── security/     JwtService, SecurityConfig
    │   └── config/       WebSocketConfig, DataSeeder, OpenApiConfig (Swagger)
    ├── main/resources/application.yml
    └── test/java/.../mqtt/MqttPayloadParserTest.java
```

| File | Làm gì |
|---|---|
| `NexoraApplication.java` | Khởi động Spring Boot, bật `@Scheduled` (dùng cho kết nối lại MQTT) |
| **entity/** | Mỗi class = 1 bảng; Hibernate tạo/cập nhật bảng khi chạy (`ddl-auto: update`) |
| `User.java` | `users`: tài khoản + hồ sơ (avatar là ảnh dạng data URL → cột MEDIUMTEXT) |
| `Sensor.java` | `sensors`: id cố định 1 Nhiệt độ °C, 2 Độ ẩm %, 3 Ánh sáng % |
| `Device.java` | `devices`: LED 1..3 (id N = `ledN` trong firmware), `status` on/off/loading, `updated_at` |
| `DataSensor.java` | `data_sensors`: 1 lần đo; `value = -1` nghĩa là không có dữ liệu (DHT11 hỏng/thiếu) |
| `DeviceAction.java` | `actions`: 1 lệnh bật/tắt của user + kết quả success/failed/loading |
| **repository/** | Spring Data JPA tự sinh câu SQL; chỉ 3 câu JPQL viết tay |
| `UserRepository.java` | Tìm user theo username hoặc email |
| `SensorRepository.java`, `DeviceRepository.java` | CRUD |
| `DataSensorRepository.java` | Số liệu mới nhất, dữ liệu biểu đồ, tìm kiếm lịch sử cảm biến |
| `DeviceActionRepository.java` | Tìm kiếm lịch sử bật/tắt |
| `dto/ApiDto.java` | Tất cả body JSON (record) + phân trang `{items, page, limit, total}` |
| `service/AuthService.java` | Đăng nhập (username hoặc email), hồ sơ, đổi mật khẩu |
| `service/SensorService.java` | Lưu dữ liệu ESP32 gửi lên, đẩy WebSocket; dashboard, biểu đồ, lịch sử |
| `service/DeviceService.java` | Danh sách LED, lịch sử, **điều khiển LED và chờ ESP32 xác nhận** |
| `service/ApiException.java` | Lỗi có mã HTTP + thông báo tiếng Việt |
| `mqtt/MqttService.java` | Kết nối broker (tự nối lại mỗi 5 s), subscribe, publish, chuyển tin nhận được thành Spring event |
| `mqtt/MqttPayloadParser.java` | Đọc payload của firmware (không phải JSON chuẩn) |
| `controller/AuthController.java` | `/health`, `/auth/login`, `/auth/logout`, `/auth/me`, `/auth/password` |
| `controller/SensorController.java` | `/sensors`, `/sensors/data`, `/sensors/history`, `/dashboard/sensors/chart` |
| `controller/DeviceController.java` | `/devices`, `/devices/control`, `/devices/history` |
| `controller/ApiExceptionHandler.java` | Mọi lỗi → `{"error": "..."}` |
| `security/JwtService.java` | Tạo / kiểm tra JWT (hết hạn sau 24h) |
| `security/SecurityConfig.java` | Đọc header `Bearer`, quy định API nào cần đăng nhập, CORS, BCrypt |
| `config/WebSocketConfig.java` | WebSocket `/ws`, kênh `/topic/sensors`, `/topic/devices` |
| `config/DataSeeder.java` | Tạo dữ liệu ban đầu nếu DB trống: `admin`/`admin123`, 3 cảm biến, LED 1..3 |
| `config/OpenApiConfig.java` | Swagger UI (`/swagger-ui.html`) + nút Authorize cho JWT |
| `application.yml` | Cấu hình chung; giá trị lấy từ `be/.env` (hoặc biến môi trường cùng tên) |

---

## 3. FE nối với BE

Các trang FE chỉ gọi interface `IotApi` (`fe/src/services/iot-api.ts`); bản cài đặt là `HttpIotApi`.

| File FE | Làm gì |
|---|---|
| `src/services/http/api-client.ts` | Axios: gắn `Authorization: Bearer <token>`, lỗi → `ApiError(status, thông báo BE)`, 401 → về `/login` |
| `src/services/http/http-iot-api.ts` | Mỗi hàm `IotApi` → 1 endpoint (bảng dưới) |
| `src/services/http/ws-connection.ts` | 1 kết nối WebSocket STOMP dùng chung, tự nối lại; mất kết nối > 5 s thì hỏi định kỳ (cảm biến 2 s, LED 10 s) |
| `src/auth/token-store.ts` | Lưu JWT trong trình duyệt |
| `vite.config.ts` | Dev server chuyển `/api` và `/ws` sang `http://localhost:8080` |

| Hàm `IotApi` | Gọi BE |
|---|---|
| `login` / `logout` | `POST /api/v1/auth/login` / `POST /api/v1/auth/logout` |
| `getCurrentUser` / `updateProfile` | `GET` / `PUT /api/v1/auth/me` |
| `changePassword` | `PATCH /api/v1/auth/password` |
| `getSensors` / `getLatestSensorData` | `GET /api/v1/sensors` / `GET /api/v1/sensors/data?limit=` |
| `getSensorChart` | `GET /api/v1/dashboard/sensors/chart?sensorId=&from=&limit=` |
| `getSensorHistory` | `GET /api/v1/sensors/history?sensors_id&from&to&search&search_kind&page&limit` |
| `getDevices` / `controlDevice` | `GET /api/v1/devices` / `POST /api/v1/devices/control` |
| `getDeviceHistory` | `GET /api/v1/devices/history?device_id&action&status&from&to&search&page&limit` |
| `onSensorData` | WebSocket `/topic/sensors` — mỗi 2 s, 3 giá trị mới |
| `onDeviceStatus` | WebSocket `/topic/devices` — mỗi khi LED đổi trạng thái |

JSON dùng snake_case (`sensors_id`, `user_name`...), thời gian `yyyy-MM-dd HH:mm:ss`, lỗi `{"error": "..."}`.

---

## 4. MQTT ↔ BE

Firmware: `iot-bai2-mqtt/esp32-mqtt-node/esp32-mqtt-node.ino`. Broker Mosquitto cổng 2005, user `TranKhacLong`.

| Topic | Chiều | Payload | BE làm gì |
|---|---|---|---|
| `sensor_data` | ESP32 → BE, mỗi 2 s | `{temp:29.50C,humid: 9%,light:45%}` | `SensorService`: lưu 3 dòng `data_sensors` → đẩy `/topic/sensors` |
| `device_control` | BE → ESP32 | `{led2:on}`, `{all:off}`, `{}` | ESP32 bật/tắt LED thật |
| `device_response` | ESP32 → BE, sau mỗi lệnh | `{led1:on,led2:off,led3:on}` | `DeviceService`: xác nhận lệnh đang chờ / cập nhật trạng thái LED → đẩy `/topic/devices` |

`MqttService` nhận tin → phát Spring event `MqttService.Message` → `SensorService.onSensorData` /
`DeviceService.onDeviceResponse` xử lý (qua `@EventListener`).

### Bấm bật LED 2 trên web
```
FE   POST /api/v1/devices/control {"deviceId":2,"action":"on"}
BE   1. LED 2 đang chờ lệnh khác?           → 400 "Thiết bị đang có lệnh đang xử lý"
     2. Ghi actions (loading), LED 2 = loading → đẩy /topic/devices
     3. MQTT device_control "{led2:on}"
ESP32    bật GPIO14 → device_response "{led1:off,led2:on,led3:off}"
BE   4. led2 = on đúng như yêu cầu → actions = success, LED 2 = on → đẩy /topic/devices
     5. HTTP 200 [{"devices_id":2,"devices_name":"LED 2","status":"on"}]
Quá 30 s không có phản hồi đúng → actions = failed, LED 2 về trạng thái cũ, HTTP 504 "Thiết bị không phản hồi"
BE chưa nối được broker        → HTTP 503 "Không kết nối được MQTT broker"
```
Khi vừa kết nối broker, BE gửi `{}`: firmware không coi là lệnh, chỉ gửi lại trạng thái 3 LED →
DB khớp với breadboard.

---

## 5. Lỗi thường gặp
| Hiện tượng | Cách sửa |
|---|---|
| `ClassNotFoundException ... NexoraApplication` | Dùng `java -jar target\nexora-be-1.0.0.jar`, không dùng `mvn spring-boot:run` |
| `Could not resolve placeholder 'DB_URL'` | Chưa có `be/.env` hoặc không chạy trong thư mục `be/` |
| `jwt.secret must be at least 32 characters` | Điền `JWT_SECRET` trong `be/.env` |
| `Access denied for user ...` khi khởi động | Sai `DB_USERNAME`/`DB_PASSWORD` trong `be/.env` |
| Log lặp `MQTT connect ... failed, retrying in 5s` | Broker chưa chạy / sai IP / sai mật khẩu MQTT |
| Bấm LED → 504 sau 30 s | ESP32 mất mạng hoặc `MQTT_HOST` trong firmware sai |
| Dashboard đứng yên | ESP32 không gửi `sensor_data` (xem Serial Monitor) |
