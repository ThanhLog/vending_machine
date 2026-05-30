/**
 * Vending Machine ESP32 Firmware - Complete
 * =========================================
 * Modules: TFT (ST7789), WiFi (AP+STA), IR sensor, Buzzer, Motor (4 slots)
 * Flow: Poll cloud API → Dispatch to vending → IR detect → Report → Update TFT
 */

#include <Arduino.h>
#include <Preferences.h>
#include "config.h"
#include "pins.h"
#include "network/network.h"
#include "tft/tft.h"
#include "buzzer/buzzer.h"
#include "motor/motor.h"
#include "services/backend/backend.service.h"
#include "services/vending/vending.service.h"
#include "services/time/time.service.h"
#include "services/weather/weather.service.h"

// ── Servo door (GPIO 15, LEDC Channel 1) ────────────
#define SERVO_CHANNEL 1
#define SERVO_FREQ 50
#define SERVO_RES 16

void initServo() {
  ledcSetup(SERVO_CHANNEL, SERVO_FREQ, SERVO_RES);
  ledcAttachPin(SERVO_PIN, SERVO_CHANNEL);
  int closeUs = map(SERVO_CLOSE_ANGLE, 0, 180, 1638, 8192);
  ledcWrite(SERVO_CHANNEL, closeUs);
}

void openDoor() {
  int openUs = map(SERVO_OPEN_ANGLE, 0, 180, 1638, 8192);
  ledcWrite(SERVO_CHANNEL, openUs);
}

void closeDoor() {
  int closeUs = map(SERVO_CLOSE_ANGLE, 0, 180, 1638, 8192);
  ledcWrite(SERVO_CHANNEL, closeUs);
}

// ── Setup ──────────────────────────────────────────
void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n\n=== VENDING MACHINE ESP32 ===");
  Serial.printf("Machine: %s\nBackend: %s\n", MACHINE_ID, BACKEND_URL);

  initTFT();           // ST7789 display + test pattern
  initBuzzer();        // LEDC PWM buzzer
  playStartupBuzzer();
  initMotor();         // 4 H-bridge motors
  initServo();         // Door servo
  initVending();       // IR sensors + state
  initTime();          // NTP time sync
  initWeather();       // Weather service
  initWiFi();          // AP+STA+Captive DNS+WebServer
  initBackend();       // HTTP client

  // Initial UI state
  if (isWiFiConnected()) {
    changeState(IDLE);
  } else {
    changeState(WIFI_SETUP);
  }

  Serial.println("[SETUP] Complete!");
  Serial.println("Ready for commands...");
}

// ── Dispatch pending command to vending ─────────────
void dispatchCommand() {
  if (!hasPendingCommand()) return;
  if (getVendingStatus() == VENDING_PROCESSING) return;  // Already dispensing

  const char* cmdId = getPendingCommandId();
  int slot = getPendingSlot();
  int orderNum = getPendingOrderNumber();

  Serial.printf("[Main] Dispatching cmd=%s slot=%d order=%d\n", cmdId, slot, orderNum);

  if (executeRemoteCommand(slot, orderNum, cmdId)) {
    // vending.service will call reportSuccess/reportError when done
    // (via finishSuccess/finishError callbacks)
  } else {
    Serial.printf("[Main] Dispatch failed - machine busy or invalid slot\n");
    reportError("Machine busy");
  }
}

// ── Loop ───────────────────────────────────────────
void loop() {
  // ── Serial command ──────────────────────────────
  if (Serial.available()) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();
    if (cmd == "reset") {
      resetOrderNumber();
      Serial.println("[Serial] System reset - Order counter reset to 1");
    } else if (cmd == "resetall") {
      Serial.println("[Serial] FULL RESET - Clearing all stored data...");
      // Reset order
      resetOrderNumber();
      // Clear WiFi preferences
      Preferences wipePrefs;
      wipePrefs.begin("network", false);
      wipePrefs.clear();
      wipePrefs.end();
      Serial.println("[Serial] WiFi credentials erased");
      Serial.println("[Serial] Restarting ESP32 in 2 seconds...");
      delay(2000);
      ESP.restart();
    } else if (cmd == "status") {
      Serial.printf("[Serial] Machine: %s\n", MACHINE_NAME);
      Serial.printf("[Serial] ID: %s\n", MACHINE_ID);
      Serial.printf("[Serial] Current order: #%d\n", getCurrentOrderNumber());
      Serial.printf("[Serial] Status: %s\n", getVendingStatusText());
      Serial.printf("[Serial] WiFi: %s\n", isWiFiConnected() ? "Connected" : "Disconnected");
    } else {
      Serial.printf("[Serial] Unknown command: %s\n", cmd.c_str());
      Serial.println("[Serial] Available: reset, resetall, status");
    }
  }

  updateNetwork();            // WebServer + Captive DNS
  processBackendCommands();   // Poll API + Heartbeat
  updateVending();            // IR sensor + motor timeout
  dispatchCommand();          // Dispatch pending cmd to vending
  // checkPurchaseTimeout();  // DISABLED - auto skip gây lỗi lượt mua
  updateBuzzer();             // Melody playback
  drawUI();                   // TFT display

  // ── UI auto-transitions ──────────────────────────
  static bool wasConnected = false;
  bool nowConnected = isWiFiConnected();

  // WiFi just connected → show IDLE
  if (nowConnected && !wasConnected && currentState == WIFI_SETUP) {
    changeState(IDLE);
    Serial.println("[UI] WiFi connected → IDLE");
  }
  // WiFi lost → show WiFi setup
  if (!nowConnected && currentState == IDLE) {
    changeState(WIFI_SETUP);
    Serial.println("[UI] WiFi lost → WIFI_SETUP");
  }
  wasConnected = nowConnected;

  // ── Update weather periodically ──────────────────
  static unsigned long lastWeather = 0;
  if (nowConnected && millis() - lastWeather > 60000) {
    lastWeather = millis();
    updateWeather();
  }

  delay(10);
}