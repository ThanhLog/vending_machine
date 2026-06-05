#include "vending.service.h"

#include "./motor/motor.h"
#include "./pins.h"
#include "./tft/tft.h"
#include "config.h"
#include "services/backend/backend.service.h"
#include <Arduino.h>

// ===== STATE =====
static bool isProcessing = false;
static int currentSlot = 0;
static unsigned long motorStartTime = 0;
static VendingStatus vendingStatus = VENDING_READY;
static unsigned long idleStartTime = 0;

int selected = 0;
int currentOrderNum = 1;

void initVending() {
  vendingStatus = VENDING_READY;
  idleStartTime = millis();
}

// ── Simple timer-based dispense (no IR sensor) ────────
static void finishSuccess() {
  stopMotor(currentSlot);
  isProcessing = false;

  int completedNum = currentOrderNum;
  vendingStatus = VENDING_SUCCESS;
  idleStartTime = millis();
  changeState(SUCCESS);

  char msg[50];
  snprintf(msg, sizeof(msg), "Mua thanh cong! #%d", completedNum);
  setNotification(msg);

  reportSuccess();
}

// ===== REMOTE COMMAND (from backend) =====
bool executeRemoteCommand(int slot, int orderNumber, const char *commandId) {
  if (isProcessing) return false;
  if (slot < 1 || slot > 4) return false;

  currentSlot = slot;
  selected = slot - 1;
  if (orderNumber > 0) {
    currentOrderNum = orderNumber;
  }
  isProcessing = true;
  motorStartTime = millis();
  vendingStatus = VENDING_PROCESSING;

  Serial.printf("[Vending] Dispensing slot=%d order=%d\n", slot, currentOrderNum);

  changeState(PROCESSING);
  motorForward(slot);

  return true;
}

// ===== UPDATE — Simple timer, no IR =====
void updateVending() {
  if (!isProcessing) return;

  // Run motor for 1 calibrated revolution, then auto-success.
  if (millis() - motorStartTime >= MOTOR_ONE_REV_MS) {
    Serial.println("[Vending] Motor 1 revolution complete -> SUCCESS");
    finishSuccess();
  }
}

VendingStatus getVendingStatus() { return vendingStatus; }

const char *getVendingStatusText() {
  switch (vendingStatus) {
  case VENDING_PROCESSING: return "processing";
  case VENDING_SUCCESS:   return "success";
  case VENDING_ERROR:     return "error";
  case VENDING_READY:
  default:                return "ready";
  }
}

int getCurrentOrderNumber() { return currentOrderNum; }

void resetOrderNumber() {
  currentOrderNum = 1;
  idleStartTime = millis();
}

void resetIdleTimer() { idleStartTime = millis(); }

void setVendingReady() {
  if (!isProcessing) {
    vendingStatus = VENDING_READY;
  }
}

void checkPurchaseTimeout() {
  // BE manages order number — no local auto-skip
}

void syncOrderNumberFromBe() {
  int beOrder = getBeOrderNumber();
  static int lastSynced = 0;
  if (beOrder > 0 && beOrder != lastSynced) {
    currentOrderNum = beOrder;
    lastSynced = beOrder;
    Serial.printf("[Sync] OrderNumber from BE: #%d\n", beOrder);
  }
}

unsigned long getIdleRemaining() {
  int beSec = getBeRemainingSeconds();
  if (hasBeServing() && beSec > 0) {
    return (unsigned long)beSec * 1000;
  }
  if (isProcessing || currentState != IDLE) return 0;
  unsigned long elapsed = millis() - idleStartTime;
  if (elapsed >= PURCHASE_TIMEOUT) return 0;
  return PURCHASE_TIMEOUT - elapsed;
}
