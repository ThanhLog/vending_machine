#include "colors.h"
#include "services/time/time.service.h"
#include "services/vending/vending.service.h"
#include "services/weather/weather.service.h"
#include "services/backend/backend.service.h"
#include "config.h"
#include "tft.h"
#include <WiFi.h>

// ==========================================
// MÀN HÌNH CHỜ CHÍNH (IDLE) - TIẾNG VIỆT
// Hiển thị: Tên máy, ID, Lượt mua, Đếm ngược, Thông báo, Thời gian
// ==========================================

void drawIdle() {
  static unsigned long lastDraw = 0;
  static String lastTime = "";
  static int lastOrderNum = -1;
  static int lastRemainSec = -1;
  static String lastNotif = "";
  static bool firstRunIdle = true;

  if (uiStateChanged) {
    firstRunIdle = true;
    lastTime = "";
    lastOrderNum = -1;
    lastRemainSec = -1;
    lastNotif = "";
    lastDraw = 0;
  }

  // Gioi han tan suat cap nhat — 200ms du cho marquee scroll muot
  if (millis() - lastDraw < 200)
    return;
  lastDraw = millis();

  int orderNum = getCurrentOrderNumber();
  String timeStr = getTimeStr();
  bool beServing = hasBeServing();
  unsigned long remainMs = getIdleRemaining();
  int remainSec = remainMs / 1000;
  int remainMin = remainSec / 60;
  int remainSecPart = remainSec % 60;

  bool showNotif = hasNotification();
  String notifMsg = showNotif ? String(getNotificationMsg()) : "";

  // 1. VẼ KHUNG CỐ ĐỊNH (Chỉ vẽ 1 lần)
  if (firstRunIdle) {
    tft.fillScreen(COLOR_BG);

    // ── Header: Tên máy + ID ─────────────────────
    tft.fillRoundRect(5, 5, 230, 50, 12, COLOR_CARD);

    // Tên máy (marquee scroll neu qua dai)
    drawMarquee(15, 8, 200, MACHINE_NAME, COLOR_ACCENT, 2);

    // ID máy
    tft.setTextColor(COLOR_SUBTEXT);
    tft.setTextSize(1);
    tft.setCursor(15, 32);
    tft.print("ID: ");
    tft.print(MACHINE_ID);

    // ── Thanh Thông báo (giữa header và lượt mua) ──
    tft.fillRoundRect(20, 60, 200, 18, 6, COLOR_BG);

    // ── Thẻ Lượt mua chính ───────────────────────
    tft.fillRoundRect(20, 82, 200, 95, 15, COLOR_CARD);

    // Nhãn "LUOT MUA"
    tft.setTextColor(COLOR_ACCENT);
    tft.setTextSize(2);
    tft.setCursor(65, 90);
    tft.print("LUOT MUA");

    // ── Thẻ đếm ngược ───────────────────────────
    tft.fillRoundRect(20, 185, 200, 38, 10, COLOR_CARD);

    tft.setTextColor(COLOR_SUBTEXT);
    tft.setTextSize(1);
    tft.setCursor(35, 198);
    tft.print("TG:");

    // ── Thẻ Trạng thái ───────────────────────────
    tft.fillRoundRect(20, 230, 200, 38, 10, COLOR_CARD);

    // ── Thẻ Giờ + WiFi ───────────────────────────
    tft.fillRoundRect(20, 274, 200, 40, 10, COLOR_CARD);

    firstRunIdle = false;
  }

  // 2. CẬP NHẬT THÔNG BÁO (marquee scroll)
  {
    bool notifChanged = (notifMsg != lastNotif);
    if (notifChanged) {
      tft.fillRect(22, 62, 196, 14, COLOR_BG);
      if (showNotif && notifMsg.length() > 0) {
        drawMarquee(25, 64, 185, notifMsg, COLOR_PRICE, 1);
      }
      lastNotif = notifMsg;
    }
    // Luon cap nhat marquee ngay ca khi text khong doi (de scroll tiep)
    if (showNotif && notifMsg.length() > 0 && !notifChanged) {
      drawMarquee(25, 64, 185, notifMsg, COLOR_PRICE, 1);
    }
  }

  // 3. CẬP NHẬT SỐ LƯỢT MUA
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

  // 4. CẬP NHẬT ĐẾM NGƯỢC (BE countdown)
  {
    int displayRemainSec = beServing ? remainSec : lastRemainSec;
    if (remainSec != lastRemainSec || firstRunIdle) {
      tft.fillRect(50, 188, 160, 28, COLOR_CARD);

      if (!beServing) {
        tft.setTextColor(COLOR_SUBTEXT);
        tft.setTextSize(2);
        tft.setCursor(45, 195);
        tft.print("CHO KHACH...");
      } else if (remainSec <= 60) {
        tft.setTextColor(COLOR_ERROR);
        tft.setTextSize(2);
        tft.setCursor(50, 195);
        tft.printf("%d:%02d", remainMin, remainSecPart);
      } else if (remainSec <= 120) {
        tft.setTextColor(COLOR_PRICE);
        tft.setTextSize(2);
        tft.setCursor(50, 195);
        tft.printf("%d:%02d", remainMin, remainSecPart);
      } else {
        tft.setTextColor(COLOR_SUCCESS);
        tft.setTextSize(2);
        tft.setCursor(50, 195);
        tft.printf("%d:%02d", remainMin, remainSecPart);
      }

      lastRemainSec = remainSec;
    }
  }

  // 5. Trạng thái
  {
    tft.fillRect(30, 238, 180, 22, COLOR_CARD);
    bool resting = isMachineResting();
    tft.setTextColor(resting ? COLOR_PRICE : COLOR_SUCCESS);
    tft.setTextSize(2);
    if (resting) {
      tft.setCursor(65, 240);
      tft.print("NGHI - HET HANG");
    } else {
      tft.setCursor(50, 240);
      tft.print("SAN SANG");
    }
  }

  // 6. CẬP NHẬT THỜI GIAN + WiFi
  if (timeStr != lastTime || firstRunIdle) {
    tft.fillRect(25, 279, 100, 28, COLOR_CARD);

    tft.setTextColor(COLOR_TEXT);
    tft.setTextSize(2);
    tft.setCursor(30, 284);
    tft.print(timeStr);

    lastTime = timeStr;
  }

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
