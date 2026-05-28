#include "colors.h"
#include "services/time/time.service.h"
#include "services/vending/vending.service.h"
#include "services/weather/weather.service.h"
#include "tft.h"
#include <math.h>


// ==========================================
// CÁC HÀM VẼ ICON (PRIVATE)
// ==========================================

static void drawSunIcon(int16_t x, int16_t y) {
  tft.fillCircle(x, y, 8, COLOR_UV);
  for (int i = 0; i < 360; i += 45) {
    float rad = i * 0.01745;
    tft.drawLine(x + cos(rad) * 11, y + sin(rad) * 11, x + cos(rad) * 16,
                 y + sin(rad) * 16, COLOR_UV);
  }
}

static void drawDropIcon(int16_t x, int16_t y) {
  tft.fillCircle(x, y, 5, COLOR_HUMID);
  tft.fillTriangle(x - 5, y, x + 5, y, x, y - 9, COLOR_HUMID);
}

// ==========================================
// MÀN HÌNH CHỜ CHÍNH (IDLE)
// ==========================================

void drawIdle() {
  static unsigned long lastDraw = 0;
  static String lastTime = "";
  static bool firstRunIdle = true;

  if (uiStateChanged) {
    firstRunIdle = true;
    lastTime = "";
    lastDraw = 0;
  }

  // Giới hạn tần suất cập nhật để tiết kiệm năng lượng/CPU
  if (millis() - lastDraw < 500)
    return;
  lastDraw = millis();

  WeatherData w = getWeather();
  String timeStr = getTimeStr();

  // 1. VẼ KHUNG CỐ ĐỊNH (Chỉ vẽ 1 lần khi khởi tạo)
  if (firstRunIdle) {
    tft.fillScreen(COLOR_BG);

    // Thẻ Thời gian (Top)
    tft.fillRoundRect(5, 5, 230, 75, 12, COLOR_CARD);

    // Thẻ Thời tiết chính (Middle)
    tft.fillRoundRect(5, 85, 230, 115, 12, COLOR_CARD);

    // Lưới các thẻ chỉ số phụ (Bottom)
    tft.fillRoundRect(5, 205, 112, 55, 8, COLOR_CARD);   // Thẻ Độ ẩm
    tft.fillRoundRect(123, 205, 112, 55, 8, COLOR_CARD); // Thẻ UV
    tft.fillRoundRect(5, 265, 230, 50, 8, COLOR_CARD);   // Thẻ AQI

    firstRunIdle = false;
  }

  // 2. CẬP NHẬT THỜI GIAN (HEADER)
  if (timeStr != lastTime) {
    tft.setTextColor(COLOR_TEXT, COLOR_CARD); // Vẽ đè màu nền để chống nháy
    tft.setTextSize(4);
    // Căn giữa tương đối cho format HH:MM
    tft.setCursor(15, 25);
    tft.print(timeStr);
    lastTime = timeStr;
  }

  // 2b. HIEN THI SO THU TU TIEP THEO
  {
    int nextNum = getCurrentOrderNumber();
    tft.setTextColor(COLOR_ACCENT, COLOR_CARD);
    tft.setTextSize(2);
    tft.setCursor(155, 15);
    tft.print("NEXT");
    tft.setCursor(155, 35);
    tft.print("#");
    if (nextNum < 100) tft.print("0");
    if (nextNum < 10) tft.print("0");
    tft.print(nextNum);
  }

  // 3. CẬP NHẬT THỜI TIẾT CHÍNH
  if (w.isValid) {
    drawSunIcon(195, 120);

    // Trạng thái
    tft.setTextColor(COLOR_SUBTEXT, COLOR_CARD);
    tft.setTextSize(2);
    tft.setCursor(20, 100);
    tft.print(w.status);

    // Nhiệt độ lớn
    tft.setTextColor(COLOR_TEMP, COLOR_CARD);
    tft.setTextSize(7);
    tft.setCursor(20, 125);
    tft.print(w.temp);

    // Đơn vị độ C
    tft.setTextSize(3);
    tft.print("o");
    tft.setTextSize(4);
    tft.print("C");
  } else {
    tft.setTextColor(COLOR_SUBTEXT, COLOR_CARD);
    tft.setTextSize(2);
    tft.setCursor(80, 135);
    tft.print("No Data");
  }

  // 4. CHỈ SỐ PHỤ (HUMIDITY & UV)
  // Độ ẩm
  drawDropIcon(20, 220);
  tft.setTextColor(COLOR_SUBTEXT, COLOR_CARD);
  tft.setTextSize(1);
  tft.setCursor(35, 215);
  tft.print("HUMIDITY");

  tft.setTextColor(COLOR_HUMID, COLOR_CARD);
  tft.setTextSize(3);
  tft.setCursor(20, 230);
  tft.print(w.humidity);
  tft.setTextSize(1);
  tft.print(" %");

  // UV Index
  tft.setTextColor(COLOR_SUBTEXT, COLOR_CARD);
  tft.setTextSize(1);
  tft.setCursor(138, 215);
  tft.print("UV INDEX");

  tft.setTextColor(COLOR_UV, COLOR_CARD);
  tft.setTextSize(3);
  tft.setCursor(138, 230);
  tft.print(w.uv);

  // 5. CHỈ SỐ AQI (BOTTOM)
  tft.setTextColor(COLOR_SUBTEXT, COLOR_CARD);
  tft.setTextSize(1);
  tft.setCursor(20, 275);
  tft.print("AIR QUALITY (AQI)");

  uint16_t aqiColor = (w.aqi < 50) ? COLOR_AQI_G : COLOR_AQI_Y;
  tft.setTextColor(aqiColor, COLOR_CARD);
  tft.setTextSize(3);
  tft.setCursor(20, 288);
  tft.print(w.aqi);

  tft.setTextSize(2);
  tft.setCursor(140, 290);
  tft.print(w.aqi < 50 ? "GOOD" : "MODERATE");
}
