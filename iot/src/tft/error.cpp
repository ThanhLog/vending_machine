#include "tft.h"
#include "buzzer/buzzer.h"
#include "colors.h"
#include "services/vending/vending.service.h"

static void drawErrorIcon(int centerX, int centerY) {
  tft.fillCircle(centerX, centerY, 30, COLOR_ERROR);
  tft.drawCircle(centerX, centerY, 33, COLOR_TEXT);

  int size = 13;
  for (int i = -2; i <= 2; i++) {
    tft.drawLine(centerX - size, centerY - size + i, centerX + size,
                 centerY + size + i, COLOR_TEXT);
    tft.drawLine(centerX + size, centerY - size + i, centerX - size,
                 centerY + size + i, COLOR_TEXT);
  }
}

void drawError() {
  static bool firstRunError = true;
  static unsigned long startTime = 0;

  if (uiStateChanged) {
    firstRunError = true;
  }

  if (firstRunError) {
    startTime = millis();
    playErrorBuzzer();
    tft.fillScreen(COLOR_BG);

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

    drawErrorIcon(120, 155);

    tft.setTextColor(COLOR_ERROR);
    tft.setTextSize(2);
    tft.setCursor(85, 95);
    tft.print("LOI ROI!");

    tft.setTextColor(COLOR_TEXT);
    tft.setTextSize(1);
    tft.setCursor(35, 205);
    tft.print("KHONG THE HOAN THANH");

    tft.setTextColor(COLOR_SUBTEXT);
    tft.setTextSize(1);
    tft.setCursor(55, 230);
    tft.print("Vui long thu lai sau");

    firstRunError = false;
  }

  if (millis() - startTime > 3000) {
    changeState(IDLE);
  }
}
