#include "backend.service.h"
#include "config.h"
#include "services/vending/vending.service.h"
#include "tft/tft.h"
#include <ArduinoJson.h>
#include <HTTPClient.h>
#include <WiFi.h>

namespace {

HTTPClient http;
unsigned long lastPoll = 0;
unsigned long lastHeartbeat = 0;

String pendingCmdId = "";
int pendingSlot = 0;
int pendingOrderNum = 0;
bool cmdReady = false;
String machineMode = "normal";  // From heartbeat response

String backendUrl = BACKEND_URL;
String machineId = MACHINE_ID;

// Convert slot string ("a1", "a3", "1", "3") to int (1-4)
int parseSlot(const JsonObjectConst &cmd) {
  // Try integer first
  if (cmd["slot"].is<int>()) {
    return cmd["slot"].as<int>();
  }
  // Try string: "a1"→1, "a2"→2, "a3"→3, "b1"→4, "1"→1, etc.
  const char *slotStr = cmd["slot"] | "";
  if (slotStr[0] == 'a' || slotStr[0] == 'A') return atoi(slotStr + 1);      // a1→1, a2→2, a3→3
  if (slotStr[0] == 'b' || slotStr[0] == 'B') return atoi(slotStr + 1) + 3;  // b1→4 (offset for row B)
  return atoi(slotStr);  // Plain number "1"→1
}

void parseCommand(const JsonDocument &doc) {
  if (doc["success"].as<bool>() == false)
    return;

  JsonArrayConst cmds = doc["data"].as<JsonArrayConst>();
  if (!cmds || cmds.size() == 0)
    return;

  JsonObjectConst cmd = cmds[0];
  pendingCmdId = cmd["id"].as<String>();
  pendingSlot = parseSlot(cmd);
  pendingOrderNum = cmd["orderNumber"] ? cmd["orderNumber"].as<int>() : 0;

  const char *product = cmd["productName"] | "Unknown";
  cmdReady = true;

  Serial.print("[Backend] Received command: ");
  Serial.print(pendingCmdId);
  Serial.print(" slot=");
  Serial.print(pendingSlot);
  Serial.print(" product=");
  Serial.println(product);

  // Hien thong bao tren man hinh
  char msg[80];
  snprintf(msg, sizeof(msg), "Don #%d: %s", pendingOrderNum, product);
  setNotification(msg);
}

void checkPendingCommands() {
  if (WiFi.status() != WL_CONNECTED)
    return;

  if (cmdReady)
    return; // Already have a pending command

  http.setTimeout(5000);
  String url = backendUrl + "/api/command/machine/" + machineId + "/pending";

  if (!http.begin(url)) {
    Serial.println("[Backend] HTTP begin failed");
    return;
  }

  http.addHeader("Accept", "application/json");
  int code = http.GET();

  if (code == 200) {
    String body = http.getString();
    JsonDocument doc;
    DeserializationError err = deserializeJson(doc, body);

    if (!err) {
      parseCommand(doc);
    } else {
      Serial.print("[Backend] JSON parse error: ");
      Serial.println(err.c_str());
    }
  } else {
    Serial.print("[Backend] Poll HTTP ");
    Serial.println(code);
  }

  http.end();
}

void reportCommandResult(const String &cmdId, const String &status,
                         const String &errorMsg = "") {
  if (WiFi.status() != WL_CONNECTED)
    return;

  http.setTimeout(5000);
  String url = backendUrl + "/api/command/machine/" + machineId +
               "/command/" + cmdId + "/status";

  if (!http.begin(url)) {
    Serial.println("[Backend] HTTP begin failed (report)");
    return;
  }

  http.addHeader("Content-Type", "application/json");

  JsonDocument body;
  body["status"] = status;
  if (errorMsg.length() > 0) {
    body["errorMessage"] = errorMsg;
  }

  String jsonBody;
  serializeJson(body, jsonBody);

  int code = http.PUT(jsonBody);

  Serial.print("[Backend] Report ");
  Serial.print(cmdId);
  Serial.print(" -> ");
  Serial.print(status);
  Serial.print(" HTTP ");
  Serial.println(code);

  http.end();
}

void sendHeartbeatImpl() {
  if (WiFi.status() != WL_CONNECTED)
    return;

  http.setTimeout(5000);
  String url = backendUrl + "/api/device/machine/" + machineId;

  if (!http.begin(url)) {
    Serial.println("[Backend] Heartbeat HTTP begin failed");
    return;
  }

  http.addHeader("Content-Type", "application/json");

  JsonDocument body;
  body["name"] = "Vending Machine " MACHINE_ID;
  body["isOnline"] = true;
  body["vendingStatus"] = getVendingStatusText();
  body["ssid"] = AP_SSID;
  body["password"] = AP_PASS;

  String jsonBody;
  serializeJson(body, jsonBody);

  int code = http.PUT(jsonBody);

  if (code == 200) {
    // Parse response to get machine mode
    String resp = http.getString();
    JsonDocument respDoc;
    DeserializationError respErr = deserializeJson(respDoc, resp);
    if (!respErr) {
      JsonObjectConst data = respDoc["data"];
      if (data && data["mode"]) {
        machineMode = data["mode"].as<String>();
      }
    }
  } else {
    Serial.print("[Backend] Heartbeat HTTP ");
    Serial.println(code);
  }

  http.end();
}

} // namespace

void initBackend() {
  Serial.println("[Backend] Service initialized");
  Serial.print("[Backend] URL: ");
  Serial.println(backendUrl);
  Serial.print("[Backend] Machine ID: ");
  Serial.println(machineId);
}

void processBackendCommands() {
  unsigned long now = millis();

  // Poll for new commands
  if (!cmdReady && now - lastPoll >= POLL_INTERVAL) {
    lastPoll = now;
    checkPendingCommands();
  }

  // Send heartbeat
  if (now - lastHeartbeat >= HEARTBEAT_INTERVAL) {
    lastHeartbeat = now;
    sendHeartbeat();
  }
}

void sendHeartbeat() { sendHeartbeatImpl(); }

bool hasPendingCommand() { return cmdReady; }

const char *getPendingCommandId() { return pendingCmdId.c_str(); }

int getPendingSlot() { return pendingSlot; }

int getPendingOrderNumber() { return pendingOrderNum; }

void clearPendingCommand() {
  cmdReady = false;
  pendingCmdId = "";
  pendingSlot = 0;
  pendingOrderNum = 0;
}

bool isMachineResting() {
  return machineMode == "rest";
}

const char *getMachineMode() {
  return machineMode.c_str();
}

// Forward declare from vending.service for reporting
void reportSuccess() {
  if (pendingCmdId.length() > 0) {
    reportCommandResult(pendingCmdId, "completed");
    clearPendingCommand();
  }
}

void reportError(const String &msg) {
  if (pendingCmdId.length() > 0) {
    reportCommandResult(pendingCmdId, "failed", msg);
    clearPendingCommand();
  }
}
