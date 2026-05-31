#include "vending.service.h"

#include "./motor/motor.h"
#include "./pins.h"
#include "./tft/tft.h"
#include "config.h"
#include "services/backend/backend.service.h"
#include <Arduino.h>

// ===== IR DETECTION FLOW STATE =====
// FLOW_START       → motor just started, waiting for IR to become CLEAR
// FLOW_WAIT_CLEAR  → waiting for product to leave position (IR goes HIGH / not blocked)
// FLOW_WAIT_DETECT → IR was clear, now waiting for product to drop through beam
// FLOW_DONE        → success or error reported
enum FlowState { FLOW_START, FLOW_WAIT_CLEAR, FLOW_WAIT_DETECT, FLOW_DONE };

// ===== STATE =====
static bool isProcessing = false;
static int currentSlot = 0;
static unsigned long processTime = 0;
static unsigned long detectedAt = 0;
static VendingStatus vendingStatus = VENDING_READY;
static unsigned long idleStartTime = 0;
static FlowState flowState = FLOW_DONE;
static unsigned long flowPhaseStart = 0;   // when current flow phase started
static unsigned long motorStartTime = 0;    // when motor actually started

int selected = 0;
int currentOrderNum = 1;

void initVending() {
  pinMode(IR1, INPUT_PULLUP);
  vendingStatus = VENDING_READY;
  idleStartTime = millis();
  flowState = FLOW_DONE;
}

bool isProductDetected() {
  return digitalRead(IR1) == IR_TRIGGER;
}

// ── Check initial IR state at motor start ──────────────────
// Returns true if IR is CLEAR (ready to detect drop)
// Returns false if IR is blocked (product still in place or sensor issue)
static bool isIrClear() {
  return !isProductDetected();
}

static void finishSuccess() {
  stopMotor(currentSlot);
  isProcessing = false;
  detectedAt = 0;
  flowState = FLOW_DONE;

  // currentOrderNum is now managed by BE — don't increment locally
  int completedNum = currentOrderNum;
  vendingStatus = VENDING_SUCCESS;
  idleStartTime = millis();
  changeState(SUCCESS);

  // Hien thong bao
  char msg[50];
  snprintf(msg, sizeof(msg), "Mua thanh cong! #%d", completedNum);
  setNotification(msg);

  // Report to backend
  reportSuccess();
}

static void finishError(const char* reason = "Khong phat hien vat pham roi") {
  stopMotor(currentSlot);
  isProcessing = false;
  detectedAt = 0;
  flowState = FLOW_DONE;
  vendingStatus = VENDING_ERROR;
  idleStartTime = millis();
  changeState(ERROR_STATE);

  // Hien thong bao
  char msg[60];
  snprintf(msg, sizeof(msg), "Loi! %s", reason);
  setNotification(msg);

  // Report to backend
  reportError(reason);
}

// ===== CHON SAN PHAM (local test) =====
bool selectProduct(int slot) {
  if (isProcessing)
    return false;

  if (slot < 1 || slot > 4)
    return false;

  currentSlot = slot;
  selected = slot - 1;
  isProcessing = true;
  detectedAt = 0;
  flowState = FLOW_START;
  flowPhaseStart = millis();
  motorStartTime = millis();
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
  // Always use orderNumber from backend (BE manages order counter)
  if (orderNumber > 0) {
    currentOrderNum = orderNumber;
  }
  isProcessing = true;
  detectedAt = 0;
  flowState = FLOW_START;
  flowPhaseStart = millis();
  motorStartTime = millis();
  vendingStatus = VENDING_PROCESSING;

  Serial.print("[Vending] Remote command: slot=");
  Serial.print(slot);
  Serial.print(" order=");
  Serial.print(currentOrderNum);
  Serial.print(" flowState=FLOW_START");
  Serial.println();

  changeState(PROCESSING);
  processTime = millis();
  motorForward(slot);

  return true;
}

// ===== UPDATE — Flow state machine for IR detection =====
void updateVending() {
  if (!isProcessing)
    return;

  unsigned long now = millis();

  switch (flowState) {
  case FLOW_START: {
    // Wait a short settling time (200ms) for motor to start,
    // then check if IR is initially clear or blocked
    if (now - flowPhaseStart < 200)
      return;

    if (isIrClear()) {
      // IR is already clear — product may have already dropped,
      // go directly to WAIT_DETECT
      flowState = FLOW_WAIT_DETECT;
      flowPhaseStart = now;
      detectedAt = 0;
      Serial.println("[Vending] IR clear at start → FLOW_WAIT_DETECT");
    } else {
      // IR is blocked — wait for it to clear (product leaving position)
      flowState = FLOW_WAIT_CLEAR;
      flowPhaseStart = now;
      Serial.println("[Vending] IR blocked at start → FLOW_WAIT_CLEAR");
    }
    return;
  }

  case FLOW_WAIT_CLEAR: {
    // Waiting for product to leave position (IR goes clear)
    if (isIrClear()) {
      // Product has left position! Now wait for it to drop through beam
      flowState = FLOW_WAIT_DETECT;
      flowPhaseStart = now;
      detectedAt = 0;
      Serial.println("[Vending] IR cleared → FLOW_WAIT_DETECT");
      return;
    }

    // Timeout: if IR stays blocked too long (3s), motor might be jammed
    if (now - flowPhaseStart > 3000) {
      finishError("IR van bi chan - kiem tra cam bien");
      return;
    }
    return;
  }

  case FLOW_WAIT_DETECT: {
    // Waiting for product to fall through beam (IR blocked)
    if (isProductDetected()) {
      if (detectedAt == 0)
        detectedAt = now;

      // Debounce: product must block beam for IR_DEBOUNCE_TIME
      if (now - detectedAt >= IR_DEBOUNCE_TIME) {
        Serial.println("[Vending] Product detected! → SUCCESS");
        finishSuccess();
        return;
      }
    } else {
      // IR is clear again — product not yet detected
      detectedAt = 0;
    }

    // Timeout: overall motor timeout from motor start
    if (now - motorStartTime > MOTOR_TIMEOUT) {
      finishError("Motor timeout - khong phat hien san pham roi");
      return;
    }
    return;
  }

  case FLOW_DONE:
  default:
    return;
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
  // Khong auto-skip luot mua — BE quan ly toan bo
  // Chi giu ham nay de tuong thich, khong lam gi
}

unsigned long getIdleRemaining() {
  if (isProcessing || currentState != IDLE) return 0;
  unsigned long elapsed = millis() - idleStartTime;
  if (elapsed >= PURCHASE_TIMEOUT) return 0;
  return PURCHASE_TIMEOUT - elapsed;
}
