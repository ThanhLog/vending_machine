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


// ===== MARQUEE SCROLLING TEXT =====
// Dung cho text dai tranh xuong dong vo layout
// Tu dong scroll neu text vuot qua maxW

struct MarqueeState {
  String text;
  int scrollX;
  int textW;
  unsigned long lastMove;
  bool waiting;     // pause o dau truoc khi scroll
  unsigned long waitStart;
};

static MarqueeState marquee1 = {"", 0, 0, 0, true, 0};
static MarqueeState marquee2 = {"", 0, 0, 0, true, 0};

void drawMarquee(int x, int y, int maxW, const String &text, uint16_t color, uint8_t size) {
  tft.setTextColor(color);
  tft.setTextSize(size);
  tft.setTextWrap(false);

  int charW = (size == 1) ? 6 : (size == 2) ? 12 : 18;
  int textW = text.length() * charW;

  // Chon slot marquee dua tren vi tri y (tranh trung lap)
  MarqueeState &mq = (y < 100) ? marquee1 : marquee2;

  // Reset neu text thay doi
  if (mq.text != text) {
    mq.text = text;
    mq.scrollX = 0;
    mq.textW = textW;
    mq.lastMove = millis();
    mq.waiting = true;
    mq.waitStart = millis();
  }

  // Neu text vua khung → ve tinh, khong scroll
  if (textW <= maxW) {
    tft.setCursor(x, y);
    tft.print(text);
    return;
  }

  unsigned long now = millis();

  // Scroll animation
  if (mq.waiting) {
    // Dung 1.5s o dau dong
    if (now - mq.waitStart > 1500) {
      mq.waiting = false;
      mq.lastMove = now;
    }
    // Ve o vi tri dau
    tft.setCursor(x, y);
    tft.print(text.substring(0, maxW / charW));
  } else {
    // Di chuyen moi 350ms
    if (now - mq.lastMove > 350) {
      mq.lastMove = now;
      mq.scrollX += charW;
      // Khi scroll het → quay lai dau sau 1.5s pause
      if (mq.scrollX > textW - maxW + charW * 3) {
        mq.scrollX = 0;
        mq.waiting = true;
        mq.waitStart = now;
      }
    }

    // Tinh offset va ve
    int charOffset = mq.scrollX / charW;
    int pixelOffset = mq.scrollX % charW;
    String visible = text.substring(charOffset);
    // Gioi han so ky tu vua man hinh
    int maxChars = maxW / charW + 2;
    if (visible.length() > maxChars) {
      visible = visible.substring(0, maxChars);
    }
    tft.setCursor(x - (pixelOffset > 0 ? pixelOffset : 0), y);
    tft.print(visible);
  }
}

void changeState(UIState newState) {
  // Reset vending status when going back to IDLE
  if (newState == IDLE && currentState != IDLE) {
    setVendingReady();
  }

  currentState = newState;
  startTime = millis();
  if (newState == IDLE) {
    resetIdleTimer();
  }
}

// ===== NOTIFICATION =====
static char notificationMsg[100] = "";
static bool notifActive = false;
static unsigned long notificationTime = 0;
#define NOTIFICATION_DURATION 5000 // 5 giay

void setNotification(const char* msg) {
  strncpy(notificationMsg, msg, 99);
  notificationMsg[99] = '\0';
  notifActive = true;
  notificationTime = millis();
  Serial.printf("[TFT] Notification: %s\n", msg);
}

void clearNotification() {
  notifActive = false;
  notificationMsg[0] = '\0';
}

bool hasNotification() {
  // Tu dong xoa notification sau 5 giay
  if (notifActive && millis() - notificationTime > NOTIFICATION_DURATION) {
    notifActive = false;
    notificationMsg[0] = '\0';
  }
  return notifActive;
}

const char* getNotificationMsg() {
  return notificationMsg;
}
