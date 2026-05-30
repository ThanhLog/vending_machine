#include "colors.h"
#include "services/time/time.service.h"
#include "services/vending/vending.service.h"
#include "services/weather/weather.service.h"
#include "config.h"
#include "tft.h"
#include <WiFi.h>

// ==========================================
// MÀN HÌNH CHỜ CHÍNH (IDLE) - TIẾNG VIỆT
// Hiển thị: Tên máy, ID, Lượt mua, Thời gian
// ==========================================

void drawIdle() {
  static unsigned long lastDraw = 0;
  static String lastTime = "";
  static int lastOrderNum = -1;
  static bool firstRunIdle = true;

  if (uiStateChanged) {
    firstRunIdle = true;
    lastTime = "";
    lastOrderNum = -1;
    lastDraw = 0;
  }

  // Giới hạn tần suất cập nhật
  if (millis() - lastDraw < 500)
    return;
  lastDraw = millis();

  int orderNum = getCurrentOrderNumber();
  String timeStr = getTimeStr();

  // 1. VẼ KHUNG CỐ ĐỊNH (Chỉ vẽ 1 lần)
  if (firstRunIdle) {
    tft.fillScreen(COLOR_BG);

    // ── Header: Tên máy + ID ─────────────────────
    tft.fillRoundRect(5, 5, 230, 60, 12, COLOR_CARD);

    // Tên máy
    tft.setTextColor(COLOR_ACCENT);
    tft.setTextSize(2);
    tft.setCursor(15, 12);
    tft.print(MACHINE_NAME);

    // ID máy
    tft.setTextColor(COLOR_SUBTEXT);
    tft.setTextSize(1);
    tft.setCursor(15, 38);
    tft.print("ID: ");
    tft.print(MACHINE_ID);

    // ── Thẻ Lượt mua chính (lớn, nổi bật) ───────
    tft.fillRoundRect(20, 75, 200, 120, 15, COLOR_CARD);

    // Nhãn "LUOT MUA"
    tft.setTextColor(COLOR_ACCENT);
    tft.setTextSize(2);
    tft.setCursor(65, 90);
    tft.print("LUOT MUA");

    // ── Thẻ Trạng thái ───────────────────────────
    tft.fillRoundRect(20, 205, 200, 55, 10, COLOR_CARD);

    // Nhãn trạng thái
    tft.setTextColor(COLOR_SUCCESS);
    tft.setTextSize(2);
    tft.setCursor(40, 225);
    tft.print("SAN SANG");

    tft.setTextColor(COLOR_SUBTEXT);
    tft.setTextSize(1);
    tft.setCursor(40, 245);
    tft.print("Vui long chon san pham");

    // ── Thẻ Giờ + WiFi ───────────────────────────
    tft.fillRoundRect(20, 268, 200, 45, 10, COLOR_CARD);

    firstRunIdle = false;
  }

  // 2. CẬP NHẬT SỐ LƯỢT MUA (khi thay đổi)
  if (orderNum != lastOrderNum) {
    // Xóa số cũ
    tft.fillRect(45, 115, 150, 55, COLOR_CARD);

    // Vẽ số thứ tự lớn
    tft.setTextColor(COLOR_TEXT);
    tft.setTextSize(6);
    tft.setCursor(55, 120);
    tft.print("#");
    if (orderNum < 100) tft.print("0");
    if (orderNum < 10) tft.print("0");
    tft.print(orderNum);

    lastOrderNum = orderNum;
  }

  // 3. CẬP NHẬT THỜI GIAN
  if (timeStr != lastTime) {
    // Xóa giờ cũ
    tft.fillRect(25, 273, 110, 30, COLOR_CARD);

    tft.setTextColor(COLOR_TEXT);
    tft.setTextSize(2);
    tft.setCursor(30, 280);
    tft.print(timeStr);

    lastTime = timeStr;
  }

  // 4. WiFi status icon
  {
    static bool lastWifi = false;
    bool wifiOk = (WiFi.status() == WL_CONNECTED);
    if (wifiOk != lastWifi || firstRunIdle) {
      // Xóa vùng WiFi cũ
      tft.fillRect(155, 278, 60, 20, COLOR_CARD);
      tft.setTextColor(wifiOk ? COLOR_SUCCESS : COLOR_ERROR);
      tft.setTextSize(1);
      tft.setCursor(155, 285);
      tft.print(wifiOk ? "WiFi OK" : "WiFi LOI");
      lastWifi = wifiOk;
    }
  }
}
