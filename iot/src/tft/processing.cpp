#include "tft.h"
#include <math.h>
#include "colors.h"
#include "services/vending/vending.service.h"

void drawProcessing() {
  static int angle = 0;
  static unsigned long lastUpdate = 0;
  static bool firstRun = true;
  static int dotCount = 0;
  static unsigned long lastDotUpdate = 0;

  if (uiStateChanged) {
    angle = 0;
    lastUpdate = 0;
    firstRun = true;
    dotCount = 0;
    lastDotUpdate = 0;
  }

  // 1. VẼ KHUNG CỐ ĐỊNH (Chỉ vẽ 1 lần khi bắt đầu trạng thái)
  if (firstRun) {
    tft.fillScreen(COLOR_BG);

    // Thẻ thông báo trung tâm
    tft.fillRoundRect(20, 60, 200, 200, 15, COLOR_CARD);

    // So thu tu
    int orderNum = getCurrentOrderNumber();
    tft.setTextColor(COLOR_ACCENT);
    tft.setTextSize(3);
    tft.setCursor(85, 70);
    tft.print("#");
    if (orderNum < 100) tft.print("0");
    if (orderNum < 10) tft.print("0");
    tft.print(orderNum);

    tft.setTextColor(COLOR_TEXT);
    tft.setTextSize(2);
    tft.setCursor(60, 105);
    tft.print("DANG XU LY");

    tft.setTextColor(COLOR_SUBTEXT);
    tft.setTextSize(1);
    tft.setCursor(55, 130);
    tft.print("Vui long cho trong giay lat");

    tft.setCursor(45, 235);
    tft.print("Dang chuan bi do uong...");

    firstRun = false;
  }

  // 2. CẬP NHẬT HIỆU ỨNG SPINNER (Mỗi 40ms)
  if (millis() - lastUpdate > 40) {
    lastUpdate = millis();

    // Tọa độ trung tâm vòng xoay
    int centerX = 120;
    int centerY = 170;
    int radius = 35;

    // Xóa vị trí cũ của spinner bằng cách vẽ đè màu của Card
    // Vẽ lại một vòng tròn nhỏ tại vị trí cũ của đuôi để làm sạch
    for (int i = 0; i < 5; i++) {
      int oldAngle = (angle - (i * 20));
      int ox = centerX + cos(oldAngle * 0.0174) * radius;
      int oy = centerY + sin(oldAngle * 0.0174) * radius;
      tft.fillCircle(ox, oy, 6, COLOR_CARD);
    }

    angle = (angle + 15) % 360;

    // Vẽ Spinner với hiệu ứng đuôi mờ dần
    // Dot chính (Sáng nhất)
    int x0 = centerX + cos(angle * 0.0174) * radius;
    int y0 = centerY + sin(angle * 0.0174) * radius;
    tft.fillCircle(x0, y0, 5, COLOR_ACCENT);

    // Dot đuôi 1
    int x1 = centerX + cos((angle - 20) * 0.0174) * radius;
    int y1 = centerY + sin((angle - 20) * 0.0174) * radius;
    tft.fillCircle(x1, y1, 4, 0x03EF); // Màu xanh mờ hơn

    // Dot đuôi 2
    int x2 = centerX + cos((angle - 40) * 0.0174) * radius;
    int y2 = centerY + sin((angle - 40) * 0.0174) * radius;
    tft.fillCircle(x2, y2, 3, COLOR_SUBTEXT);
  }

  // 3. HIỆU ỨNG DẤU CHẤM ĐỘNG (...)
  if (millis() - lastDotUpdate > 500) {
    lastDotUpdate = millis();
    dotCount = (dotCount + 1) % 4;

    tft.fillRect(175, 105, 30, 20, COLOR_CARD); // Xóa vùng dấu chấm
    tft.setCursor(175, 105);
    tft.setTextColor(COLOR_TEXT);
    tft.setTextSize(2);
    for (int i = 0; i < dotCount; i++)
      tft.print(".");
  }
}
