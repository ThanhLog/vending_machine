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
static unsigned long processTime = 0;
static unsigned long detectedAt = 0;
static VendingStatus vendingStatus = VENDING_READY;
static unsigned long idleStartTime = 0;

int selected = 0;
int currentOrderNum = 1;

void initVending() {
  pinMode(IR1, INPUT_PULLUP);
  vendingStatus = VENDING_READY;
  idleStartTime = millis();
}

bool isProductDetected() {
  return digitalRead(IR1) == IR_TRIGGER;
}

static void finishSuccess() {
  stopMotor(currentSlot);
  isProcessing = false;
  detectedAt = 0;
  int completedNum = currentOrderNum;
  currentOrderNum++;
  vendingStatus = VENDING_SUCCESS;
  idleStartTime = millis(); // reset idle timer sau khi mua xong
  changeState(SUCCESS);

  // Hien thong bao
  char msg[50];
  snprintf(msg, sizeof(msg), "Mua thanh cong! #%d", completedNum);
  setNotification(msg);

  // Report to backend
  reportSuccess();
}

static void finishError() {
  stopMotor(currentSlot);
  isProcessing = false;
  detectedAt = 0;
  vendingStatus = VENDING_ERROR;
  idleStartTime = millis(); // reset idle timer sau khi loi
  changeState(ERROR_STATE);

  // Hien thong bao
  setNotification("Loi! Vui long thu lai");

  // Report to backend
  reportError("Khong phat hien vat pham roi - Motor timeout");
}

// ===== CHON SAN PHAM =====
bool selectProduct(int slot) {
  if (isProcessing)
    return false;

  if (slot < 1 || slot > 4)
    return false;

  currentSlot = slot;
  selected = slot - 1;
  isProcessing = true;
  detectedAt = 0;
  vendingStatus = VENDING_PROCESSING;

  changeState(PROCESSING);
  processTime = millis();
  motorForward(slot);

  return true;
}

// ===== REMOTE COMMAND =====
bool executeRemoteCommand(int slot, int orderNumber, const char *commandId) {
  if (isProcessing)
    return false;

  if (slot < 1 || slot > 4)
    return false;

  currentSlot = slot;
  selected = slot - 1;
  // Nếu backend gửi orderNumber hợp lệ (> 0) thì dùng, ngược lại giữ local counter
  if (orderNumber > 0) {
    currentOrderNum = orderNumber;
  }
  isProcessing = true;
  detectedAt = 0;
  vendingStatus = VENDING_PROCESSING;

  Serial.print("[Vending] Remote command: slot=");
  Serial.print(slot);
  Serial.print(" order=");
  Serial.println(currentOrderNum);

  changeState(PROCESSING);
  processTime = millis();
  motorForward(slot);

  return true;
}

// ===== UPDATE =====
void updateVending() {
  if (!isProcessing)
    return;

  if (isProductDetected()) {
    if (detectedAt == 0)
      detectedAt = millis();

    if (millis() - detectedAt >= IR_DEBOUNCE_TIME) {
      finishSuccess();
      return;
    }
  } else {
    detectedAt = 0;
  }

  if (millis() - processTime > MOTOR_TIMEOUT) {
    finishError();
  }
}

VendingStatus getVendingStatus() {
  return vendingStatus;
}

const char *getVendingStatusText() {
  switch (vendingStatus) {
  case VENDING_PROCESSING:
    return "processing";
  case VENDING_SUCCESS:
    return "success";
  case VENDING_ERROR:
    return "error";
  case VENDING_READY:
  default:
    return "ready";
  }
}

int getCurrentOrderNumber() {
  return currentOrderNum;
}

void resetOrderNumber() {
  currentOrderNum = 1;
  idleStartTime = millis();
  Serial.println("[Vending] Order number reset to 1");
}

void resetIdleTimer() {
  idleStartTime = millis();
}

void checkPurchaseTimeout() {
  // Chi kiem tra timeout khi may dang o trang thai IDLE va ko dang xu ly
  if (isProcessing) return;
  if (currentState != IDLE) return;

  unsigned long elapsed = millis() - idleStartTime;
  if (elapsed >= PURCHASE_TIMEOUT) {
    int oldNum = currentOrderNum;
    currentOrderNum++;
    idleStartTime = millis();
    Serial.printf("[Vending] Purchase timeout! Skipping to #%d\n", currentOrderNum);

    // Hien thong bao tren man hinh
    char msg[60];
    snprintf(msg, sizeof(msg), "Het gio! Luot #%d -> #%d", oldNum, currentOrderNum);
    setNotification(msg);
  }
}

unsigned long getIdleRemaining() {
  if (isProcessing || currentState != IDLE) return 0;
  unsigned long elapsed = millis() - idleStartTime;
  if (elapsed >= PURCHASE_TIMEOUT) return 0;
  return PURCHASE_TIMEOUT - elapsed;
}
