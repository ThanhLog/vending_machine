#include "tft.h"
#include <SPI.h>
#include "./pins.h"
#include "services/vending/vending.service.h"


// ===== COLOR DEFINE =====
uint16_t BG_COLOR;
uint16_t PRIMARY;
uint16_t ACCENT;
uint16_t TEXT_COLOR;
uint16_t SUCCESS_COLOR;
uint16_t ERROR_COLOR;

// ===== TFT =====
SPIClass spi = SPIClass(VSPI);
Adafruit_ST7789 tft = Adafruit_ST7789(&spi, TFT_CS, TFT_DC, TFT_RST);

// ===== STATE =====
UIState currentState = WIFI_SETUP;
bool uiStateChanged = true;

// ===== TEST BOOT =====
bool isTesting = true;
unsigned long testTime = 0;
unsigned long startTime = 0;
int testStep = 0;

// ===== INIT =====
void initTFT() {
  spi.begin(TFT_SCK, -1, TFT_MOSI, TFT_CS);

  // ===== CUSTOM COLOR =====
  BG_COLOR = tft.color565(15, 15, 20);      // nền tối
  PRIMARY = tft.color565(0, 180, 255);      // xanh cyan đẹp
  ACCENT = tft.color565(255, 200, 0);       // vàng highlight
  TEXT_COLOR = tft.color565(255, 255, 255); // trắng
  SUCCESS_COLOR = tft.color565(0, 200, 100);
  ERROR_COLOR = tft.color565(255, 60, 60);


  tft.init(240, 320);
  tft.setRotation(2);

  // 🔥 fix lỗi test không chạy
  isTesting = true;
  testStep = 0;
  testTime = millis();

  tft.fillScreen(ST77XX_BLACK);
}

// ===== UI =====
void drawUI() {

  // ===== TEST MÀU =====
  if (isTesting) {

    // chạy ngay lần đầu
    if (testStep == 0) {
      tft.fillScreen(ST77XX_RED);
      testStep = 1;
      testTime = millis();
      return;
    }

    if (millis() - testTime > 500) {
      testTime = millis();
      testStep++;

      switch (testStep) {
      case 2:
        tft.fillScreen(ST77XX_GREEN);
        break;

      case 3:
        tft.fillScreen(ST77XX_BLUE);
        break;

      case 4:
        tft.fillScreen(ST77XX_BLACK);
        isTesting = false;
        break;
      }
    }

    return;
  }

  // ===== STATE MACHINE =====
  static UIState lastState = (UIState)-1;

  uiStateChanged = currentState != lastState;

  if (uiStateChanged) {
    tft.fillScreen(ST77XX_BLACK);
    lastState = currentState;
  }

  switch (currentState) {

  case WIFI_SETUP:
    drawWifiSetup();
    break;

  case IDLE:
    drawIdle();
    break;

  case SELECT:
    drawSelect();
    break;

  case PROCESSING:
    drawProcessing();
    break;

  case SUCCESS:
    drawSuccess();
    break;

  case ERROR_STATE:
    drawError();
    break;
  }

  uiStateChanged = false;
}


void changeState(UIState newState) {
  currentState = newState;
  startTime = millis();
  // Reset idle timer khi vao trang thai IDLE
  if (newState == IDLE) {
    resetIdleTimer();
  }
}

// ===== NOTIFICATION =====
static char notificationMsg[100] = "";
static bool hasNotification = false;
static unsigned long notificationTime = 0;
#define NOTIFICATION_DURATION 5000 // 5 giay

void setNotification(const char* msg) {
  strncpy(notificationMsg, msg, 99);
  notificationMsg[99] = '\0';
  hasNotification = true;
  notificationTime = millis();
  Serial.printf("[TFT] Notification: %s\n", msg);
}

void clearNotification() {
  hasNotification = false;
  notificationMsg[0] = '\0';
}

bool hasNotification() {
  // Tu dong xoa notification sau 5 giay
  if (hasNotification && millis() - notificationTime > NOTIFICATION_DURATION) {
    hasNotification = false;
    notificationMsg[0] = '\0';
  }
  return hasNotification;
}

const char* getNotificationMsg() {
  return notificationMsg;
}
