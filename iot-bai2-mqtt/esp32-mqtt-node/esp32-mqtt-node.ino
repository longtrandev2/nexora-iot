/*
 * BAI 2 - IoT: ESP32 + MQTT (Mosquitto chay tren laptop)
 *
 * Phan cung (da lap theo huong dan):
 *   - LED 1 -> GPIO 12, LED 2 -> GPIO 14, LED 3 -> GPIO 27
 *   - Cam bien anh sang (Quang tro + dien tro 10k) -> GPIO 32
 *   - Cam bien nhiet do LM35DZ -> GPIO 33
 *   - Cam bien do am DHT11 -> GPIO 13 (chua lap: code van chay, humid = -1)
 *
 * 3 Topic MQTT:
 *   sensor_data    : ESP32 pub du lieu cam bien moi 2 giay
 *   device_control : ESP32 sub lenh dieu khien LED tu phan mem
 *   device_response: ESP32 pub lai trang thai LED thuc te sau khi thuc hien
 *
 * Thu vien can cai qua Arduino IDE > Tools > Manage Libraries:
 *   1. "PubSubClient" (by Nick O'Leary)
 *   2. "DHT sensor library" (by Adafruit) + "Adafruit Unified Sensor"
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>

const char* WIFI_SSID     = "YOUR_WIFI_SSID";      
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD"; 
const char* MQTT_HOST     = "172.20.10.2"; 

const int   MQTT_PORT = 2005;
const char* MQTT_USER = "TranKhacLong";
const char* MQTT_PASS = "YOUR_MQTT_PASSWORD";   

const char* TOPIC_SENSOR   = "sensor_data";
const char* TOPIC_CONTROL  = "device_control";
const char* TOPIC_RESPONSE = "device_response";

// Chan GPIO theo breadboard da lap
const int LED_PINS[3]    = {12, 14, 27};
const char* LED_NAMES[3] = {"led1", "led2", "led3"};
const int LDR_PIN        = 32;    // quang tro 
const int LM35_PIN       = 33;    // LM35: 10mV tuong ung 1 do C
const int DHT_PIN        = 13;    // DHT11 
const uint8_t DHT_TYPE   = DHT11;

WiFiClient   wifiClient;
PubSubClient mqtt(wifiClient);
DHT          dht(DHT_PIN, DHT_TYPE);

bool ledStates[3]       = {false, false, false};
unsigned long lastPublish = 0;
const unsigned long PUBLISH_INTERVAL_MS = 2000; // ban du lieu 2 giay 1 lan

// ----------------- Doc cam bien -----------------

// LM35: cu 10mV o chan giua = 1 do C -> doc mV roi chia 10
float readTemperatureC() {
  uint32_t sumMv = 0;
  for (int i = 0; i < 32; i++) sumMv += analogReadMilliVolts(LM35_PIN); // avg 32 lan giam nhieu
  return sumMv / 32.0 / 10.0;
}

// Quang tro: 3V3 -- LDR --(GPIO32)-- tro 10k -- GND
// Cang sang -> LDR cang nho tro -> dien ap tai GPIO32 cang cao -> % cao
int readLightPercent() {
  uint32_t sumMv = 0;
  for (int i = 0; i < 32; i++) sumMv += analogReadMilliVolts(LDR_PIN);
  int pct = map(sumMv / 32, 0, 3300, 0, 100);
  return constrain(pct, 0, 100);
}

// DHT11: chua lap hoac loi -> tra ve -1 de phan mem biet khong co du lieu
float readHumidity() {
  float h = dht.readHumidity();
  return isnan(h) ? -1 : h;
}

// ----------------- Dieu khien LED -----------------

void applyLeds() {
  for (int i = 0; i < 3; i++) {
    digitalWrite(LED_PINS[i], ledStates[i] ? HIGH : LOW);
  }
}

// Pub lai trang thai thuc te len topic device_response
void publishResponse() {
  String res = "{";
  for (int i = 0; i < 3; i++) {
    res += String(LED_NAMES[i]) + ":" + (ledStates[i] ? "on" : "off");
    if (i < 2) res += ",";
  }
  res += "}";
  mqtt.publish(TOPIC_RESPONSE, res.c_str());
  Serial.println("[MQTT] Phan hoi: " + res);
}

// Callback: chay khi co tin nhan den tu topic da sub (device_control)
// Vi du tin nhan: {led1:on,led2:off,led3:on} hoac bat/tat tat ca: {all:on} / {all:off}
void onControlMessage(char* topic, byte* payload, unsigned int length) {
  String msg;
  for (unsigned int i = 0; i < length; i++) msg += (char)payload[i];
  Serial.println("[MQTT] Nhan lenh: " + msg);
  msg.toLowerCase(); // bo qua khac biet hoa/thuong khi parse

  // Lenh tat ca cung luc: {all:on} / {all:off}
  if      (msg.indexOf("all:on")  >= 0) { for (int i = 0; i < 3; i++) ledStates[i] = true;  }
  else if (msg.indexOf("all:off") >= 0) { for (int i = 0; i < 3; i++) ledStates[i] = false; }

  for (int i = 0; i < 3; i++) {
    if (msg.indexOf(String(LED_NAMES[i]) + ":on")  >= 0) ledStates[i] = true;
    if (msg.indexOf(String(LED_NAMES[i]) + ":off") >= 0) ledStates[i] = false;
  }
  applyLeds();        // bat/tat LED that tren breadboard
  publishResponse();  // bao ket qua lai cho phan mem
}

// ----------------- Ket noi WiFi / MQTT -----------------

void setupWifi() {
  Serial.print("[WiFi] Dang ket noi: ");
  Serial.println(WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.print("\n[WiFi] Da ket noi! IP cua ESP32: ");
  Serial.println(WiFi.localIP());
}

void connectMqtt() {
  while (!mqtt.connected()) {
    Serial.print("[MQTT] Dang ket noi broker ");
    Serial.print(MQTT_HOST);
    Serial.print(":");
    Serial.println(MQTT_PORT);
    // Client ID phai duy nhat tren broker
    String clientId = "esp32-" + String((uint32_t)ESP.getEfuseMac(), HEX);
    bool ok = (strlen(MQTT_USER) > 0)
                ? mqtt.connect(clientId.c_str(), MQTT_USER, MQTT_PASS)
                : mqtt.connect(clientId.c_str());
    if (ok) {
      Serial.println("[MQTT] Ket noi OK, client id: " + clientId);
      mqtt.subscribe(TOPIC_CONTROL);
      Serial.println("[MQTT] Da sub topic: " + String(TOPIC_CONTROL));
    } else {
      Serial.print("[MQTT] That bai, ma loi state=");
      Serial.println(mqtt.state()); // -2: khong toi duoc server, -4: sai user/pass
      Serial.println("     -> thu lai sau 2 giay");
      delay(2000);
    }
  }
}

// ----------------- Main -----------------

void setup() {
  Serial.begin(115200);
  for (int i = 0; i < 3; i++) {
    pinMode(LED_PINS[i], OUTPUT);
    digitalWrite(LED_PINS[i], LOW); // tat het LED khi khoi dong
  }
  dht.begin();
  setupWifi();
  mqtt.setServer(MQTT_HOST, MQTT_PORT);
  mqtt.setCallback(onControlMessage);
  connectMqtt();
}

void loop() {
  if (!mqtt.connected()) connectMqtt(); // tu ket noi lai neu mat ket noi
  mqtt.loop(); // phai goi lien tuc de nhan duoc tin nhan sub

  unsigned long now = millis();
  if (now - lastPublish >= PUBLISH_INTERVAL_MS) {
    lastPublish = now;
    float t = readTemperatureC();
    float h = readHumidity();
    int   l = readLightPercent();
    String payload = "{temp:" + String(t, 2) + "C" +
                     ",humid:" + String(h, 0) + "%" +
                     ",light:" + String(l) + "%}";
    if (mqtt.publish(TOPIC_SENSOR, payload.c_str())) {
      Serial.println("[MQTT] Da gui: " + payload);
    } else {
      Serial.println("[MQTT] Gui that bai!");
    }
  }
}
