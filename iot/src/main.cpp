#include "network/network.h"
#include "services/backend/backend.service.h"
#include "services/time/time.service.h"
#include "services/vending/vending.service.h"
#include "services/weather/weather.service.h"

#include "buzzer/buzzer.h"
#include "motor/motor.h"
#include "tft/tft.h"

static bool wifiWasConnected = false;
static bool backendInitialized = false;

void setup() {
  Serial.begin(115200);

  initWiFi();
  initTime();
  initWeather();
  initMotor();
  initVending();
  initBuzzer();
  initTFT();
  playStartupBuzzer();
}

void loop() {
  updateNetwork();
  updateWeather();
  updateBuzzer();
  drawUI();

  bool wifiConnected = isWiFiConnected();

  // ── WiFi state machine ────────────────────────────
  if (wifiConnected && !wifiWasConnected) {
    // Just connected — init backend, switch to IDLE
    Serial.println("[Main] WiFi connected, starting backend services...");
    initBackend();
    backendInitialized = true;
    changeState(IDLE);
  }

  if (!wifiConnected && wifiWasConnected) {
    // Just disconnected — back to setup
    Serial.println("[Main] WiFi lost, returning to setup mode...");
    changeState(WIFI_SETUP);
  }

  wifiWasConnected = wifiConnected;

  // ── Operational mode (WiFi connected) ─────────────
  if (wifiConnected && currentState != WIFI_SETUP) {
    updateVending();
    processBackendCommands();

    // Execute remote command if one is pending and we're idle
    if (hasPendingCommand() && getVendingStatus() == VENDING_READY) {
      int slot = getPendingSlot();
      int orderNum = getPendingOrderNumber();
      const char *cmdId = getPendingCommandId();

      Serial.print("[Main] Executing remote command slot=");
      Serial.print(slot);
      Serial.print(" order=");
      Serial.println(orderNum);

      executeRemoteCommand(slot, orderNum, cmdId);
    }
  }

  // ── Serial debug (always available) ───────────────
  if (Serial.available()) {
    char c = Serial.read();

    if (c == '1')
      selectProduct(1);

    if (c == '2')
      selectProduct(2);

    if (c == '3')
      selectProduct(3);

    if (c == '4')
      selectProduct(4);
  }
}
