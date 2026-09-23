# Bài 2 — IoT: ESP32 + MQTT (Mosquitto broker trên laptop)

Đề bài: ESP32 đọc 3 cảm biến (nhiệt độ LM35, ánh sáng quang trở, độ ẩm DHT11), điều khiển 3 LED, giao tiếp qua MQTT với Mosquitto broker chạy trên laptop. Demo bằng 3 cửa sổ terminal.

---

## 1. Cấu trúc thư mục

```
iot-bai2-mqtt/
├── README.md                          # file này — hướng dẫn đầy đủ
└── esp32-mqtt-node/
    └── esp32-mqtt-node.ino            # code ESP32 nạp bằng Arduino IDE
```

File `.ino` là toàn bộ chương trình của thiết bị (hardware node). Không có file code nào khác — 2 terminal còn lại chỉ chạy lệnh `mosquitto_sub` / `mosquitto_pub` có sẵn khi cài Mosquitto.

---

## 2. Kiến thức cần nắm (checklist tự kiểm tra trước khi demo)

### 2.1. MQTT là gì
- Mô hình **Publisher / Subscriber** qua **Broker** (bưu điện trung chuyển):
  - **Publisher**: gửi (publish) tin nhắn lên 1 **topic** (địa chỉ tin nhắn), không cần biết ai nhận.
  - **Subscriber**: đăng ký (subscribe) 1 topic, mọi tin gửi đến topic đó đều được broker đẩy về.
  - **Broker** (Mosquitto): nhận tin từ publisher, đẩy cho tất cả subscriber cùng topic. Publisher và subscriber **không biết nhau** — đây là điểm khác chính với mô hình client-server.
- 1 client có thể vừa pub vừa sub cùng lúc (ESP32 của mình làm vậy).
- Topic là chuỗi phân cách bằng `/`, phân biệt hoa/thường — pub và sub phải gõ **giống hệt nhau**.
- QoS (chất lượng truyền): 0 = gửi 1 lần không xác nhận (mình dùng, đủ cho demo), 1 = ít nhất 1 lần, 2 = đúng 1 lần.

### 2.2. Các lệnh terminal Mosquitto
| Flag | Nghĩa |
|---|---|
| `-h` | host (IP broker — laptop) |
| `-p` | **port** (2005) |
| `-t` | topic |
| `-m` | message (chỉ dùng cho pub) |
| `-u` | username |
| `-P` | **password** (viết HOA — dễ nhầm với `-p` port!) |
| `-v` | verbose: in kèm tên topic trước message |

### 2.3. Phần cứng / điện tử
- **LED**: chỉ dẫn điện 1 chiều (chân dài +, chân ngắn −). Điện trở hạn dòng bảo vệ LED và chân ESP32 (tối đa ~20-40mA/chân).
- **Quang trở (LDR)**: điện trở thay đổi theo sáng (sáng → trở nhỏ). ESP32 chỉ đo được **điện áp** → mắc **mạch phân áp** `3V3 — LDR — (GPIO32) — trở — GND`: càng sáng thì điện áp tại GPIO32 càng cao.
- **LM35DZ**: IC đo nhiệt độ, chân giữa xuất **10mV cho mỗi °C** → đọc millivolt rồi chia 10. Cấp 5V (chân VIN), cấm cấm ngược âm/dương (nóng bỏng, cháy).
- **DHT11**: đo độ ẩm không khí, giao tiếp digital 1 dây, cần thư viện DHT. Module 3 chân có sẵn trở pull-up.
- **ESP32 ADC**: chân analog đọc điện áp 0–3.3V, hàm `analogReadMilliVolts()` trả về millivolt (có hiệu chuẩn, ổn định hơn `analogRead()`).

### 2.4. Thư viện Arduino
- **PubSubClient** (Nick O'Leary): MQTT client cho ESP32 — `connect()`, `publish()`, `subscribe()`, `setCallback()`, `loop()`.
- **DHT sensor library** (Adafruit, kèm Adafruit Unified Sensor): đọc DHT11.
- Chương trình Arduino: `setup()` chạy 1 lần khi khởi động, `loop()` chạy lặp mãi mãi. Nạp qua USB, chương trình lưu trong flash → rút cable cắm sạc dự phòng vẫn tự chạy.

---

## 3. Kiến trúc kết nối

### 3.1. Sơ đồ hệ thống
```
      [ESP32 + breadboard]                       [LAPTOP]
      3 LED  : GPIO 12, 14, 27            ┌─────────────────────────────┐
      LDR    : GPIO 32                    │  Mosquitto broker :2005     │
      LM35   : GPIO 33                    │  (tài khoản: TranKhacLong)       │
      DHT11  : GPIO 13 (lắp sau)          │                             │
           │                              │  cmd 1: sub sensor_data     │
           │   WiFi chung nhà (2.4GHz)    │  cmd 2: sub device_response │
           └─────────────────────────────►│  cmd 3: pub device_control  │
               MQTT over TCP:2005         └─────────────────────────────┘
```

### 3.2. Bảng nối chân ESP32
| Thiết bị | Chân ESP32 | Vị trí breadboard |
|---|---|---|
| LED 1 (đỏ) | GPIO 12 | dài `10a`, trở `10b→15a`, dây `15b` |
| LED 2 (vàng) | GPIO 14 | dài `20a`, trở `20b→25a`, dây `25b` |
| LED 3 (xanh) | GPIO 27 | dài `30a`, trở `30b→35a`, dây `35b` |
| Quang trở + trở phân áp | GPIO 32 | LDR `40a-41a`, 3V3→`40b`, trở `41b→dải −`, GPIO32→`41c` |
| LM35 (mặt chữ hướng mắt: 1-VCC, 2-OUT, 3-GND) | GPIO 33 | 5V/VIN→`50b`, GPIO33→`51b`, GND→`52b` |
| DHT11 module 3 chân (lắp sau) | GPIO 13 | VCC→`60a` (3V3), DATA→`61a`, GND→`62a` |
| GND chung | GND | dải xanh `−` |

Ghi chú linh kiện thực tế: đang dùng trở **4k thay 10k** cho mạch phân áp LDR → thang % sáng dịch thấp hơn (~4% tối → ~67% đèn pin) nhưng demo vẫn rõ, không cần sửa code.

### 3.3. Luồng dữ liệu (đây là phần "giải thích khi demo")
```
(1) mỗi 2s: ESP32 pub "sensor_data" {temp:29.5,humid:60,light:45}
        ESP32 ───────────► broker ───────────► cmd 1 (sub sensor_data)

(2) cmd 3: pub "device_control" {led1:on,led2:off,led3:on}
        cmd 3 ───────────► broker ───────────► ESP32 (đang sub topic này)

(3) ESP32 nhận lệnh → bật/tắt LED THẬT trên breadboard

(4) ESP32 pub "device_response" {led1:on,led2:off,led3:on}
        ESP32 ───────────► broker ───────────► cmd 2 (sub device_response)
```

Diễn giải: broker là bưu điện — mọi tin nhắn đều đi qua nó, nó đẩy tin cho **tất cả** client đang sub topic tương ứng. Bước (4) khác bước (2) ở chỗ: đây là **trạng thái thực tế của đèn do thiết bị xác nhận**, giúp phần mềm biết lệnh đã đến và đã được thực hiện (vòng lặp đóng).

---

## 4. Cài đặt (làm 1 lần)

### 4.1. Arduino IDE
1. Cài Arduino IDE (đã có).
2. File → Preferences → thêm URL boards: `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json` → Boards Manager → cài **esp32 by Espressif Systems** (nếu chưa có).
3. Tools → Manage Libraries → cài:
   - **PubSubClient** (by Nick O'Leary)
   - **DHT sensor library** (by Adafruit) → đồng ý cài kèm **Adafruit Unified Sensor**
4. Tools → Board → **ESP32 Dev Module**.

### 4.2. Mosquitto trên laptop
1. Tải + cài: <https://mosquitto.org/download/> (tick cài service).
2. Kiểm tra lệnh chạy được ở mọi thư mục: gõ `mosquitto_sub --help` — nếu không nhận ra thì thêm `C:\Program Files\mosquitto` vào biến môi trường Path rồi mở lại cmd.
3. Mở `C:\Program Files\mosquitto\mosquitto.conf` bằng Notepad **quyền Admin**, thêm cuối file:
```
listener 2005
allow_anonymous false
password_file C:\Program Files\mosquitto\pwfile
```
4. Tạo tài khoản (cmd **Admin**, nhập mật khẩu 2 lần):
```powershell
& "C:\Program Files\mosquitto\mosquitto_passwd.exe" -c "C:\Program Files\mosquitto\pwfile" TranKhacLong
```
5. Restart service + mở firewall (Admin):
```powershell
Restart-Service mosquitto
netsh advfirewall firewall add rule name="Mosquitto 2005" dir=in action=allow protocol=TCP localport=2005
```
6. Lấy IP LAN của laptop:
```powershell
ipconfig    # ghi lại dòng IPv4 Address, ví dụ 172.20.10.2
```
> Mặc định Mosquitto chỉ nghe localhost → bắt buộc `listener` mới để ESP32 nối từ WiFi vào. IP laptop có thể đổi (DHCP) — trước mỗi buổi demo chạy `ipconfig` lại. ESP32 và laptop phải **cùng 1 WiFi**, và WiFi đó là **2.4GHz**.

---

## 5. Cấu hình trong code

Sửa 4 dòng đầu `esp32-mqtt-node.ino`:
```cpp
const char* WIFI_SSID     = "TEN_WIFI";       // WiFi 2.4GHz
const char* WIFI_PASSWORD = "MAT_KHAU_WIFI";
const char* MQTT_HOST     = "172.20.10.2";   // IP laptop (ipconfig)
const int   MQTT_PORT     = 2005;
const char* MQTT_USER     = "TranKhacLong";
const char* MQTT_PASS     = "YOUR_MQTT_PASSWORD";       // mật khẩu đã tạo ở bước 4.2
```
Đổi port nếu thầy yêu cầu port khác → đổi **cả 3 nơi**: `mosquitto.conf` (listener), `MQTT_PORT` trong code, `-p` trong lệnh terminal. Đổi mật khẩu → chạy lại `mosquitto_passwd` (bỏ `-c` nếu chỉ đổi pass, `-c` là tạo file mới).

---

## 6. Chạy demo

### 6.1. Thứ tự khởi động
1. Nạp code: cắm USB → chọn Port (Tools → Port) → **Upload** → mở **Serial Monitor 115200** (= cửa sổ HW, xem log ESP32). Chờ till thấy:
```
[WiFi] Da ket noi! IP cua ESP32: 192.168.1.25
[MQTT] Ket noi OK, client id: esp32-xxxx
[MQTT] Da sub topic: device_control
[MQTT] Da gui: {temp:29.5,humid:-1,light:45}
```
2. Mở 3 cửa sổ cmd trên laptop:

```bat
:: cmd 1 — SW nhận dữ liệu cảm biến
mosquitto_sub -h 172.20.10.2 -p 2005 -u TranKhacLong -P YOUR_MQTT_PASSWORD -t "sensor_data" -v

:: cmd 2 — SW nhận phản hồi thiết bị
mosquitto_sub -h 172.20.10.2 -p 2005 -u TranKhacLong -P YOUR_MQTT_PASSWORD -t "device_response" -v

:: cmd 3 — SW gửi lệnh điều khiển (gõ khi cần, mỗi lần 1 lệnh)
mosquitto_pub -h 172.20.10.2 -p 2005 -u TranKhacLong -P YOUR_MQTT_PASSWORD -t "device_control" -m "{led1:on,led2:off,led3:on}"

:: bật/tắt TẤT CẢ đèn cùng lúc (lệnh "all")
mosquitto_pub -h 172.20.10.2 -p 2005 -u TranKhacLong -P YOUR_MQTT_PASSWORD -t "device_control" -m "{all:on}"
mosquitto_pub -h 172.20.10.2 -p 2005 -u TranKhacLong -P YOUR_MQTT_PASSWORD -t "device_control" -m "{all:off}"
```
*(thay `172.20.10.2` và `YOUR_MQTT_PASSWORD` bằng của mình)*

### 6.2. Kịch bản thuyết trình gợi ý
1. **Giới thiệu hệ thống**: ESP32 (node thiết bị) — Mosquitto trên laptop (broker) — terminal (phần mềm). 3 topic: `sensor_data`, `device_control`, `device_response`.
2. **Dữ liệu cảm biến**: cmd 1 đang nhận tin mỗi 2s. Che tay lên quang trở → `light` giảm mạnh; nắm LM35 → `temp` tăng dần. (`humid:-1` = chưa gắn DHT11, gắn vào là có số.)
3. **Điều khiển**: gõ lệnh pub ở cmd 3 → LED trên breadboard đổi trạng thái **ngay lập tức**.
4. **Phản hồi**: cmd 2 nhận `{led1:on,led2:off,led3:on}` — trùng đúng trạng thái LED đang sáng.
5. **Giải thích luồng** theo mục 3.3. Nhấn mạnh: publisher/subscriber không biết nhau, broker trung chuyển hết.

### 6.3. Code hoạt động thế nào (đọc để trả lời thầy)
| Hàm trong code | Chức năng |
|---|---|
| `setup()` | cấu hình chân LED, khởi động DHT, nối WiFi, nối MQTT, đăng ký callback |
| `setupWifi()` | nối WiFi, chờ tới khi có IP |
| `connectMqtt()` | nối broker (kèm user/pass), sub `device_control`, tự nối lại khi mất kết nối |
| `onControlMessage()` | **callback** — chạy mỗi khi có tin đến `device_control`: gộp payload thành chuỗi, tìm `led1:on` / `led2:off`... đổi biến trạng thái, `digitalWrite` LED thật, rồi pub phản hồi |
| `publishResponse()` | ghói trạng thái 3 LED → pub lên `device_response` |
| `readTemperatureC()` | đọc mV trung bình 8 lần ở GPIO33 / 10 = °C |
| `readLightPercent()` | đọc mV GPIO32, quy về % 0–100 |
| `readHumidity()` | đọc DHT11, chưa gắn / lỗi → trả −1 |
| `loop()` | giữ kết nối MQTT (`mqtt.loop()` bắt buộc để nhận tin) + mỗi 2000ms pub `sensor_data` |

---

## 7. Xử lý lỗi nhanh
| Hiện tượng | Nguyên nhân / cách sửa |
|---|---|
| Serial in `state=-2` hoài | sai IP laptop / firewall chặn / chưa `Restart-Service mosquitto` sau sửa conf |
| Serial in `state=-4` | sai user/pass — khớp `MQTT_USER/MQTT_PASS` với `mosquitto_passwd` |
| Serial in `state=-5` | chưa được cấp quyền (broker cũ) — kiểm tra conf |
| WiFi cũn cindle `.....` mãi | WiFi 5GHz / sai mật khẩu / yếu sóng |
| cmd báo không nhận lệnh `mosquitto_sub` | thêm `C:\Program Files\mosquitto` vào Path, mở lại cmd |
| Terminal im re | gõ sai topic (phân biệt hoa/thường) / thiếu `-p 2005 -u -P` |
| Compile lỗi `analogReadMilliVolts` | update ESP32 core trong Boards Manager |
| `humid:-1` | chưa gắn DHT11 hoặc nối sai chân |

---

## 8. Việc còn treo
- [ ] Lắp DHT11 khi mượn được (module 3 chân): VCC→`60a`(3V3), DATA→`61a`(GPIO13), GND→`62a` — cắm là chạy, khỏi nạp lại code.
- [ ] Đổi port theo yêu cầu thầy (nếu có) — nhớ đủ 3 nơi: conf / code / lệnh.

---

## 9. Nguyên lý linh kiện & dòng điện — để trả lời khi thầy hỏi

### 9.1 Kiến thức nền: dòng điện, điện áp, âm dương
- **Mạch phải khép kín**: dòng chỉ chạy khi có đường vòng từ cực (+) qua linh kiện về cực (−). Thiếu đường về → không có dòng → không gì chạy.
- **Điện áp (V)** = lực "đẩy" dòng · **dòng (mA)** = lượng điện chảy · **điện trở (Ω)** = vật cản. Liên hệ: I = U/R (định luật Ohm).
- ESP32: chân tín hiệu xuất cao **3.3V**, mỗi chân chịu tối đa ~**40mA** → phải hạn dòng cho LED.
- Chiều lắp: LED có chiều (chân dài +, ngắn −) · trở & quang trở **không** phân cực (cắm chiều nào cũng được) · **LM35 có chiều, cấm cắm ngược** (nóng bỏng, cháy) · DHT11 có chiều (nhìn chữ trên board).

### 9.2 Breadboard hoạt động thế nào
- Mỗi hàng ngang 5 lỗ (a–e) thông nhau bằng thanh kim bên trong; **hàng khác số thì cách nhau**; rãnh giữa chia đôi bảng → mỗi linh kiện chiếm vài hàng riêng để chân không chạm nhau.
- Dải dọc rìa (−) chạy thông suốt chiều dọc → dùng làm **GND chung** cho mọi linh kiện.
- Ví dụ LED1: LED chân dài ở hàng 10, trở 1 chân cũng hàng 10 (thông nhau), chân kia kéo sang hàng 15 nơi dây GPIO12 cắm vào → dòng đi GPIO12 → hàng 15 → trở → hàng 10 → LED → GND.

### 9.3 Từng linh kiện: hoạt động + vì sao lắp như vậy

**a) LED + điện trở hạn dòng**
- LED = diode phát quang: chỉ dẫn 1 chiều (+ → −), có dòng ~5–20mA là sáng.
- LED không tự hạn dòng — cắm thẳng 3.3V dòng sẽ rất lớn → cháy LED, hại chân ESP32 → **bắt buộc** có trở nối tiếp.
- Tính trở: R = (3.3V − 2V rơi trên LED) / 10mA ≈ 130Ω → dùng 220–330Ω an toàn (dòng ~6–10mA, sáng vừa).
- Trở đứng trước hay sau LED đều như nhau: nối tiếp thì cùng một dòng, hạn dòng như nhau.
- GPIO = "công tắc điện tử": `digitalWrite(HIGH)` = chân lên 3.3V (dòng chạy, đèn sáng), `LOW` = 0V (không chênh lệch, không dòng, tắt).

**b) Quang trở (LDR) + trở 10k (mình dùng 4k) — mạch PHÂN ÁP**
- LDR: điện trở **thay đổi theo sáng** (sáng ~vài kΩ, tối ~hàng MΩ).
- ESP32 **không đo được điện trở** — chân analog chỉ đo **điện áp** → phải mắc LDR nối tiếp trở cố định, lấy điện áp tại **điểm giữa**: `3V3 — LDR — (GPIO32) — trở — GND`.
- Công thức: `V(GPIO32) = 3.3 × R_dưới / (R_dưới + LDR)` → trời sáng: LDR nhỏ → V cao → % sáng cao.
- Vì sao 10k: gần trị số LDR ở mức sáng thường → dải điện áp thay đổi **rộng nhất** (nhạy nhất). Dùng 4k vẫn chạy, chỉ thang % thấp hơn (~4–67%).
- Dòng nhánh này luôn < 1mA → an toàn.

**c) LM35DZ — cảm biến nhiệt độ**
- Là **IC** (khác LDR): phải được cấp nguồn (trái +5V, phải GND) thì mạch bên trong mới chạy; chân giữa xuất **tuyến tính 10mV/°C** → 25°C = 250mV.
- Vì sao cấp 5V (chân VIN): datasheet khuyến nghị 4–30V, đo ổn định hơn nguồn 3.3V.
- Tín hiệu 0.2–0.4V nằm gọn trong dải đo 0–3.3V của ADC → nối thẳng GPIO33; code đọc mV rồi chia 10 ra °C.
- **Cấm cắm ngược cực**: phân cực ngược → dòng lớn → nóng bỏng, cháy ngay. Cầm nhìn mặt khắc chữ: trái VCC, giữa OUT, phải GND.

**d) DHT11 — cảm biến độ ẩm (lắp sau)**
- Đo độ ẩm không khí, xuất **tín hiệu số** theo giao thức 1 dây riêng → không đo bằng ADC được, cần thư viện DHT để "dịch".
- Module 3 chân có sẵn trở pull-up trên board → chỉ cần 3 dây: VCC, DATA (GPIO13), GND.
- Chưa lắp: code đọc lỗi → gửi `humid:-1` để bên nhận biết "không có dữ liệu" (đây cũng là kỹ thuật kiểm tra thiết bị hỏng/thiếu trong IoT).

### 9.4 Các chân ESP32 đang dùng — mỗi chân làm gì
| Chân | Loại | Vai trò trong bài |
|---|---|---|
| 3V3 | nguồn ra 3.3V | cấp cho nhánh phân áp LDR |
| VIN / 5V | nguồn ra 5V từ USB | cấp cho LM35 |
| GND (mấy chân đều chung) | âm chung | "đường về" của mọi mạch |
| GPIO 12, 14, 27 | digital out | bật/tắt 3 LED |
| GPIO 32, 33 | **analog in (ADC1)** | đo điện áp LDR (32), LM35 (33) |
| GPIO 13 | digital | giao tiếp DHT11 |
| TX/RX (qua USB) | serial | in log Serial Monitor |
| EN / BOOT | nút | reset / giữ BOOT khi Upload kẹt "Connecting..." |

- **Vì sao chọn 32/33 làm chân đo**: chúng thuộc khối **ADC1** — khối **ADC2** (GPIO 0, 2, 4, 13–15, 25–27...) bị **WiFi chiếm dụng** nên không đọc analog được khi đang nối WiFi. Bài này WiFi chạy 100% thời gian → buộc dùng chân ADC1 (32–39).
- GPIO 12/14/27/13 chỉ xuất/nhập digital (HIGH/LOW) nên dùng chân nào cũng được — chọn chân rảnh, tiện đi dây.

### 9.5 Vì sao phải nối GND chung
- Mọi điện áp đều đo **so với một điểm tham chiếu 0V**. Các mạch dùng chung nguồn mà không chung 0V thì điện áp đo ra sẽ lệch, tín hiệu nhiễu.
- Dải xanh breadboard = điểm 0V chung — LED, LDR, LM35... cùng "chung một cái cống". Thiếu nó: đo sai, mạch không khớp nhau.

### 9.6 Nói mẫu 1 vòng dòng hoàn chỉnh (ví dụ LED2)
"Gõ lệnh `led2:on` → MQTT gửi xuống ESP32 → GPIO14 được kéo lên 3.3V → dòng chạy từ chân GPIO14 → qua điện trở hạn dòng → qua LED2 (chân dài → chân ngắn) → xuống dải GND chung → về ESP32 → LED sáng. Tắt LED = GPIO14 kéo về 0V → không có chênh lệch điện áp → không có dòng → tắt."
