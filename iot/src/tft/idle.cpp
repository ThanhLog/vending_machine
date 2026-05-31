#include "colors.h"
#include "services/time/time.service.h"
#include "services/vending/vending.service.h"
#include "services/weather/weather.service.h"
#include "services/backend/backend.service.h"
#include "config.h"
#include "tft.h"
#include <WiFi.h>

// ==========================================
// MÀN HÌNH CHỜ CHÍNH (IDLE)
// ==========================================

void drawIdle() {
  static unsigned long lastDraw = 0;
  static String lastTime = "";
  static int lastOrderNum = -1;
  static int lastRemainSec = -1;
  static bool lastBeServing = false;
  static String lastNotif = "";
  static bool lastResting = false;
  static bool firstRunIdle = true;

  if (uiStateChanged) {
    firstRunIdle = true;
    lastTime = "";
    lastOrderNum = -1;
    lastRemainSec = -1;
    lastBeServing = false;
    lastNotif = "";
    lastResting = false;
    lastDraw = 0;
  }

  // Refresh 200ms for smooth marquee
  if (millis() - lastDraw < 200) return;
  lastDraw = millis();

  int orderNum = getCurrentOrderNumber();
  String timeStr = getTimeStr();
  bool beServing = hasBeServing();
  bool resting = isMachineResting();
  unsigned long remainMs = getIdleRemaining();
  int remainSec = remainMs / 1000;

  bool showNotif = hasNotification();
  String notifMsg = showNotif ? String(getNotificationMsg()) : "";

  // ── Force redraw when serving state changes ──────
  bool servingChanged = (beServing != lastBeServing);
  bool restingChanged = (resting != lastResting);

  // ===== 1. KHUNG CỐ ĐỊNH (vẽ 1 lần) =====
  if (firstRunIdle) {
    tft.fillScreen(COLOR_BG);

    // Header: machine name + ID
    tft.fillRoundRect(5, 5, 230, 50, 12, COLOR_CARD);

    tft.setTextColor(COLOR_SUBTEXT);
    tft.setTextSize(1);
    tft.setCursor(15, 32);
    tft.print("ID: ");
    tft.print(MACHINE_ID);

    // Notification bar
    tft.fillRoundRect(20, 60, 200, 18, 6, COLOR_BG);

    // Main order number card
    tft.fillRoundRect(20, 82, 200, 95, 15, COLOR_CARD);
    tft.setTextColor(COLOR_ACCENT);
    tft.setTextSize(2);
    tft.setCursor(65, 90);
    tft.print("LUOT MUA");

    // Countdown card
    tft.fillRoundRect(20, 185, 200, 38, 10, COLOR_CARD);
    tft.setTextColor(COLOR_SUBTEXT);
    tft.setTextSize(1);
    tft.setCursor(35, 198);
    tft.print("TG:");

    // Status card
    tft.fillRoundRect(20, 230, 200, 38, 10, COLOR_CARD);

    // Time + WiFi card
    tft.fillRoundRect(20, 274, 200, 40, 10, COLOR_CARD);

    firstRunIdle = false;
  }

  // ===== 2. MACHINE NAME (marquee every frame) =====
  drawMarquee(15, 8, 200, MACHINE_NAME, COLOR_ACCENT, 2);

  // ===== 3. NOTIFICATION (marquee) =====
  if (notifMsg != lastNotif) {
    tft.fillRect(22, 62, 196, 14, COLOR_BG);
    lastNotif = notifMsg;
  }
  if (showNotif && notifMsg.length() > 0) {
    drawMarquee(25, 64, 185, notifMsg, COLOR_PRICE, 1);
  }

  // ===== 4. ORDER NUMBER =====
  if (orderNum != lastOrderNum) {
    tft.fillRect(45, 112, 150, 50, COLOR_CARD);
    tft.setTextColor(COLOR_TEXT);
    tft.setTextSize(5);
    tft.setCursor(55, 118);
    tft.print("#");
    if (orderNum < 100) tft.print("0");
    if (orderNum < 10) tft.print("0");
    tft.print(orderNum);
    lastOrderNum = orderNum;
  }

  // ===== 5. COUNTDOWN (from BE) =====
  if (remainSec != lastRemainSec || servingChanged || firstRunIdle) {
    tft.fillRect(50, 188, 160, 28, COLOR_CARD);

    if (!beServing) {
      tft.setTextColor(COLOR_SUBTEXT);
      tft.setTextSize(2);
      tft.setCursor(35, 195);
      tft.print("CHO KHACH...");
    } else {
      int remainMin = remainSec / 60;
      int remainSecPart = remainSec % 60;
      if (remainSec <= 30) {
        tft.setTextColor(COLOR_ERROR);
      } else if (remainSec <= 60) {
        tft.setTextColor(COLOR_PRICE);
      } else {
        tft.setTextColor(COLOR_SUCCESS);
      }
      tft.setTextSize(2);
      tft.setCursor(45, 195);
      tft.printf("%d:%02d", remainMin, remainSecPart);
    }
    lastRemainSec = remainSec;
    lastBeServing = beServing;
  }

  // ===== 6. STATUS =====
  if (restingChanged || firstRunIdle) {
    tft.fillRect(30, 238, 180, 22, COLOR_CARD);
    tft.setTextColor(resting ? COLOR_PRICE : COLOR_SUCCESS);
    tft.setTextSize(2);
    if (resting) {
      tft.setCursor(40, 240);
      tft.print("NGHI - HET HANG");
    } else {
      tft.setCursor(50, 240);
      tft.print("SAN SANG");
    }
    lastResting = resting;
  }

  // ===== 7. TIME =====
  if (timeStr != lastTime || firstRunIdle) {
    tft.fillRect(25, 279, 100, 28, COLOR_CARD);
    tft.setTextColor(COLOR_TEXT);
    tft.setTextSize(2);
    tft.setCursor(30, 284);
    tft.print(timeStr);
    lastTime = timeStr;
  }

  // ===== 8. WIFI ICON =====
  {
    static bool lastWifiIcon = false;
    bool wifiOk = (WiFi.status() == WL_CONNECTED);
    if (wifiOk != lastWifiIcon || firstRunIdle) {
      tft.fillRect(140, 282, 70, 22, COLOR_CARD);
      tft.setTextColor(wifiOk ? COLOR_SUCCESS : COLOR_ERROR);
      tft.setTextSize(1);
      tft.setCursor(148, 288);
      tft.print(wifiOk ? "WiFi ON" : "WiFi OFF");
      lastWifiIcon = wifiOk;
    }
  }
}
