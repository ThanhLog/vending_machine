/**
 * Vending Machine ESP32 Firmware
 * ==============================
 * Chế độ: AP + STA đồng thời
 * - AP: "Vending_Setup" / "12345678" (cho app check gần máy)
 * - STA: Kết nối WiFi internet (cho poll lệnh từ cloud)
 *
 * Phần cứng:
 * - Slot a1 → GPIO 16 (relay/motor 1)
 * - Slot a2 → GPIO 17 (relay/motor 2)
 * - Slot a3 → GPIO 18 (relay/motor 3)
 *
 * Cấu hình WiFi lần đầu qua endpoint /api/wifi (POST)
 */

#include <WiFi.h>
#include <WebServer.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Preferences.h>

// ── Cấu hình mặc định ─────────────────────────────────
#define AP_SSID       "Vending_Setup"
#define AP_PASSWORD   "12345678"
#define MACHINE_ID    "vending_01"

// Cloud API
#define API_BASE      "https://apivendingmachine.thiephaoy.shop"

// ── GPIO Motor / Relay ────────────────────────────────
const int MOTOR_PINS[] = { 16, 17, 18 };  // a1, a2, a3
const int NUM_SLOTS = 3;
const int MOTOR_RUN_MS = 3000;  // Thời gian bật motor (3 giây)

// ── Global objects ────────────────────────────────────
WebServer server(80);
Preferences prefs;  // Lưu WiFi credentials vào flash

String sta_ssid = "";
String sta_pass = "";
bool wifiConnected = false;
unsigned long lastPollTime = 0;
const unsigned long POLL_INTERVAL = 3000;  // Poll mỗi 3 giây

// ── Trạng thái máy ────────────────────────────────────
String vendingStatus = "ready";  // ready, dispensing
int currentOrder = 0;
int totalClients = 0;
String currentCommandId = "";
String dispensingSlot = "";

// ======================================================
//  SETUP
// ======================================================
void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n\n[ESP32] Vending Machine Firmware starting...");

  // ── Init motor pins ─────────────────────────────────
  for (int i = 0; i < NUM_SLOTS; i++) {
    pinMode(MOTOR_PINS[i], OUTPUT);
    digitalWrite(MOTOR_PINS[i], LOW);
  }

  // ── Load saved WiFi credentials ─────────────────────
  prefs.begin("vending", false);
  sta_ssid = prefs.getString("ssid", "");
  sta_pass = prefs.getString("pass", "");

  // ── Start AP mode (luôn chạy để app check) ─────────
  WiFi.softAP(AP_SSID, AP_PASSWORD);
  Serial.printf("[AP]  SSID: %s, Password: %s, IP: %s\n",
                AP_SSID, AP_PASSWORD, WiFi.softAPIP().toString().c_str());

  // ── Connect WiFi STA (nếu có credentials) ───────────
  if (sta_ssid.length() > 0) {
    connectToWiFi();
  }

  // ── Web server routes ───────────────────────────────
  setupRoutes();
  server.begin();
  Serial.println("[HTTP] Server started on port 80");

  Serial.println("[ESP32] Setup complete!\n");
}

// ======================================================
//  LOOP
// ======================================================
void loop() {
  server.handleClient();

  // Poll cloud API for pending commands
  if (wifiConnected && millis() - lastPollTime > POLL_INTERVAL) {
    lastPollTime = millis();
    pollPendingCommands();
  }
}

// ======================================================
//  WIFI CONNECTION
// ======================================================
void connectToWiFi() {
  Serial.printf("[STA] Connecting to WiFi: %s ...\n", sta_ssid.c_str());
  WiFi.begin(sta_ssid.c_str(), sta_pass.c_str());

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    wifiConnected = true;
    Serial.printf("\n[STA] Connected! IP: %s\n", WiFi.localIP().toString().c_str());
  } else {
    wifiConnected = false;
    Serial.println("\n[STA] Failed to connect. Will retry later.");
  }
}

// ======================================================
//  WEB SERVER ROUTES
// ======================================================

void setupRoutes() {
  // CORS headers for mobile app
  server.enableCORS(true);

  // GET /api/status - App kiểm tra trạng thái ESP32
  server.on("/api/status", HTTP_GET, []() {
    StaticJsonDocument<512> doc;
    doc["ok"] = true;
    doc["machineId"] = MACHINE_ID;
    doc["ssid"] = AP_SSID;
    doc["vendingStatus"] = vendingStatus;
    doc["wifiConnected"] = wifiConnected;
    doc["currentOrder"] = currentOrder;
    doc["clients"] = WiFi.softAPgetStationNum();
    doc["dispensingSlot"] = dispensingSlot;

    String resp;
    serializeJson(doc, resp);

    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(200, "application/json", resp);
  });

  // POST /api/wifi - App gửi WiFi credentials cho ESP32
  server.on("/api/wifi", HTTP_POST, []() {
    if (!server.hasArg("plain")) {
      server.send(400, "application/json", "{\"ok\":false,\"error\":\"No body\"}");
      return;
    }

    StaticJsonDocument<256> body;
    DeserializationError err = deserializeJson(body, server.arg("plain"));
    if (err) {
      server.send(400, "application/json", "{\"ok\":false,\"error\":\"Invalid JSON\"}");
      return;
    }

    String newSsid = body["ssid"] | "";
    String newPass = body["password"] | "";

    if (newSsid.length() == 0) {
      server.send(400, "application/json", "{\"ok\":false,\"error\":\"SSID required\"}");
      return;
    }

    // Save credentials
    sta_ssid = newSsid;
    sta_pass = newPass;
    prefs.putString("ssid", sta_ssid);
    prefs.putString("pass", sta_pass);

    Serial.printf("[WiFi Config] New SSID: %s\n", sta_ssid.c_str());

    // Connect to new WiFi
    WiFi.disconnect();
    delay(500);
    connectToWiFi();

    StaticJsonDocument<128> resp;
    resp["ok"] = true;
    resp["connected"] = wifiConnected;
    String r;
    serializeJson(resp, r);
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(200, "application/json", r);
  });

  // OPTIONS handler for CORS preflight
  server.on("/api/wifi", HTTP_OPTIONS, []() {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
    server.send(204);
  });

  // Root - simple info
  server.on("/", HTTP_GET, []() {
    server.send(200, "text/html",
      "<h1>Vending Machine ESP32</h1>"
      "<p>Machine: " MACHINE_ID "</p>"
      "<p>Status: " + vendingStatus + "</p>"
      "<p>WiFi: " + String(wifiConnected ? "Connected" : "Disconnected") + "</p>"
      "<p>Clients: " + String(WiFi.softAPgetStationNum()) + "</p>");
  });

  server.onNotFound([]() {
    server.send(404, "application/json", "{\"error\":\"Not found\"}");
  });
}

// ======================================================
//  POLL CLOUD API FOR PENDING COMMANDS
// ======================================================

void pollPendingCommands() {
  HTTPClient http;
  String url = String(API_BASE) + "/api/command/machine/" MACHINE_ID "/pending";

  http.begin(url);
  http.setTimeout(10000);

  int code = http.GET();

  if (code == 200) {
    String payload = http.getString();
    StaticJsonDocument<1024> doc;
    DeserializationError err = deserializeJson(doc, payload);

    if (!err && doc["success"] == true) {
      JsonArray commands = doc["data"].as<JsonArray>();

      if (commands.size() > 0) {
        Serial.printf("[Poll] Found %d pending command(s)\n", commands.size());

        for (JsonObject cmd : commands) {
          String cmdId = cmd["id"] | "";
          String slot = cmd["slot"] | "";
          String productName = cmd["productName"] | "";

          Serial.printf("  → Command: %s, Slot: %s, Product: %s\n",
                        cmdId.c_str(), slot.c_str(), productName.c_str());

          executeCommand(cmdId, slot, productName);
        }
      }
    }
  } else if (code > 0) {
    Serial.printf("[Poll] HTTP error: %d\n", code);
  } else {
    Serial.printf("[Poll] Connection failed: %s\n", http.errorToString(code).c_str());
    // WiFi might be down, try reconnect
    if (WiFi.status() != WL_CONNECTED) {
      wifiConnected = false;
      connectToWiFi();
    }
  }

  http.end();
}

// ======================================================
//  EXECUTE DISPENSE COMMAND
// ======================================================

void executeCommand(String cmdId, String slot, String productName) {
  // Update status → processing
  updateCommandStatus(cmdId, "processing", "");

  // Xác định motor pin từ slot
  int motorIndex = slotToIndex(slot);
  if (motorIndex < 0) {
    Serial.printf("[ERROR] Unknown slot: %s\n", slot.c_str());
    updateCommandStatus(cmdId, "failed", "Unknown slot: " + slot);
    return;
  }

  // Chạy motor
  vendingStatus = "dispensing";
  dispensingSlot = slot;
  currentOrder++;

  Serial.printf("[Dispense] Slot %s → Motor GPIO %d (%d ms)\n",
                slot.c_str(), MOTOR_PINS[motorIndex], MOTOR_RUN_MS);

  digitalWrite(MOTOR_PINS[motorIndex], HIGH);
  delay(MOTOR_RUN_MS);
  digitalWrite(MOTOR_PINS[motorIndex], LOW);

  vendingStatus = "ready";
  dispensingSlot = "";

  // Update status → completed
  updateCommandStatus(cmdId, "completed", "");

  Serial.printf("[Dispense] Command %s COMPLETED - Product: %s\n",
                cmdId.c_str(), productName.c_str());
}

// ======================================================
//  UPDATE COMMAND STATUS TO SERVER
// ======================================================

void updateCommandStatus(String cmdId, String status, String errorMsg) {
  HTTPClient http;
  String url = String(API_BASE) + "/api/command/machine/" MACHINE_ID
             + "/command/" + cmdId + "/status";

  StaticJsonDocument<256> body;
  body["status"] = status;
  if (errorMsg.length() > 0) {
    body["errorMessage"] = errorMsg;
  }

  String jsonBody;
  serializeJson(body, jsonBody);

  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(10000);

  int code = http.PUT(jsonBody);

  if (code == 200) {
    Serial.printf("[API] Command %s status updated → %s\n", cmdId.c_str(), status.c_str());
  } else {
    Serial.printf("[API] Failed to update command status: %d\n", code);
  }

  http.end();
}

// ======================================================
//  HELPERS
// ======================================================

int slotToIndex(String slot) {
  slot.toLowerCase();
  if (slot == "a1" || slot == "1") return 0;
  if (slot == "a2" || slot == "2") return 1;
  if (slot == "a3" || slot == "3") return 2;
  return -1;
}
