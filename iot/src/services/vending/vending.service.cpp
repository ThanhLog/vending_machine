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

int selected = 0;
int currentOrderNum = 1;

void initVending() {
  pinMode(IR1, INPUT_PULLUP);
  vendingStatus = VENDING_READY;
}

bool isProductDetected() {
  return digitalRead(IR1) == IR_TRIGGER;
}

static void finishSuccess() {
  stopMotor(currentSlot);
  isProcessing = false;
  detectedAt = 0;
  currentOrderNum++;
  vendingStatus = VENDING_SUCCESS;
  changeState(SUCCESS);

  // Report to backend
  reportSuccess();
}

static void finishError() {
  stopMotor(currentSlot);
  isProcessing = false;
  detectedAt = 0;
  vendingStatus = VENDING_ERROR;
  changeState(ERROR_STATE);

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
  currentOrderNum = orderNumber;
  isProcessing = true;
  detectedAt = 0;
  vendingStatus = VENDING_PROCESSING;

  Serial.print("[Vending] Remote command: slot=");
  Serial.print(slot);
  Serial.print(" order=");
  Serial.println(orderNumber);

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
