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

// ── IR Test mode variables ──────────────────────────
bool irTestMode = false;
unsigned long irTestStart = 0;
unsigned long lastIrPrint = 0;

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
    } else if (cmd == "irtest") {
      Serial.println("\n========== IR SENSOR TEST ==========");
      Serial.println("Doc lien tuc 5 cam bien IR trong 30 giay");
      Serial.println("Gui 'irstop' de dung som");
      Serial.println("Che / khong che cam bien de kiem tra");
      Serial.println("GPIO: IR1=32 IR2=33 IR3=34 IR4=35 IR5=39");
      Serial.println("INPUT_PULLUP → HIGH=clear, LOW=blocked");
      Serial.println("=====================================\n");
      irTestMode = true;
      irTestStart = millis();
    } else if (cmd == "irstop") {
      irTestMode = false;
      Serial.println("[IR Test] Stopped");
      changeState(IDLE);
    } else {
      Serial.printf("[Serial] Unknown command: %s\n", cmd.c_str());
      Serial.println("[Serial] Available: reset, resetall, status, irtest, irstop");
    }
  }

  // ── IR TEST MODE ─────────────────────────────────
  if (irTestMode) {
    // Auto-stop after 60 seconds
    if (millis() - irTestStart > 60000) {
      irTestMode = false;
      Serial.println("\n[IR Test] Auto-stopped after 60s");
      changeState(IDLE);
    }
    // Print every 500ms
    else if (millis() - lastIrPrint > 500) {
      lastIrPrint = millis();
      int ir1 = digitalRead(IR1);
      int ir2 = digitalRead(IR2);
      int ir3 = digitalRead(IR3);
      int ir4 = digitalRead(IR4);
      int ir5 = digitalRead(IR5);

      bool b1 = (ir1 == IR_TRIGGER);
      bool b2 = (ir2 == IR_TRIGGER);
      bool b3 = (ir3 == IR_TRIGGER);
      bool b4 = (ir4 == IR_TRIGGER);
      bool b5 = (ir5 == IR_TRIGGER);
      Serial.println("─── IR Sensors ───");
      Serial.printf("  IR1(GPIO32): %s %s\n", ir1 == LOW ? "LOW " : "HIGH", b1 ? "🔴 BLOCKED" : "🟢 CLEAR");
      Serial.printf("  IR2(GPIO33): %s %s\n", ir2 == LOW ? "LOW " : "HIGH", b2 ? "🔴 BLOCKED" : "🟢 CLEAR");
      Serial.printf("  IR3(GPIO34): %s %s\n", ir3 == LOW ? "LOW " : "HIGH", b3 ? "🔴 BLOCKED" : "🟢 CLEAR");
      Serial.printf("  IR4(GPIO35): %s %s\n", ir4 == LOW ? "LOW " : "HIGH", b4 ? "🔴 BLOCKED" : "🟢 CLEAR");
      Serial.printf("  IR5(GPIO39): %s %s\n", ir5 == LOW ? "LOW " : "HIGH", b5 ? "🔴 BLOCKED" : "🟢 CLEAR");

      // Draw on TFT
      tft.fillScreen(ST77XX_BLACK);
      tft.setTextColor(ST77XX_WHITE);
      tft.setTextSize(2);
      tft.setCursor(10, 10);
      tft.print("IR TEST MODE");

      const int irPins[5] = {IR1, IR2, IR3, IR4, IR5};
      const int irGpios[5] = {32, 33, 34, 35, 39};
      for (int i = 0; i < 5; i++) {
        int y = 50 + i * 45;
        int val = digitalRead(irPins[i]);
        bool blocked = (val == IR_TRIGGER);

        tft.fillRoundRect(10, y, 220, 38, 6,
                          blocked ? tft.color565(80, 20, 20) : tft.color565(20, 60, 20));
        tft.setTextSize(2);
        tft.setTextColor(blocked ? ST77XX_RED : ST77XX_GREEN);
        tft.setCursor(20, y + 8);
        tft.printf("IR%d GPIO%d", i + 1, irGpios[i]);

        tft.setTextColor(ST77XX_WHITE);
        tft.setCursor(170, y + 8);
        tft.print(blocked ? "CHAN" : "OK");
      }
    }
    delay(50);
    return; // Skip normal operations during IR test
  }

  updateNetwork();            // WebServer + Captive DNS
  processBackendCommands();   // Poll API + Heartbeat (syncs orderNumber + countdown)
  syncOrderNumberFromBe();    // Sync order number from BE heartbeat to vending
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