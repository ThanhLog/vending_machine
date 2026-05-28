#include "tft.h"
#include "buzzer/buzzer.h"
#include "colors.h"
#include "services/vending/vending.service.h"

static void drawCheckIcon(int centerX, int centerY) {
  // Vẽ vòng tròn nền
  tft.fillCircle(centerX, centerY, 30, COLOR_SUCCESS);
  tft.drawCircle(centerX, centerY, 33, COLOR_TEXT);

  for (int i = -2; i <= 2; i++) {
    tft.drawLine(centerX - 15, centerY + i, centerX - 4, centerY + 12 + i,
                 COLOR_TEXT);
  }

  for (int i = -2; i <= 2; i++) {
    tft.drawLine(centerX - 4, centerY + 12 + i, centerX + 18, centerY - 10 + i,
                 COLOR_TEXT);
  }
}

void drawSuccess() {
  static bool firstRunSuccess = true;
  static unsigned long startTime = 0;

  if (uiStateChanged) {
    firstRunSuccess = true;
  }

  if (firstRunSuccess) {
    startTime = millis();
    playSuccessBuzzer();
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

    drawCheckIcon(120, 155);

    tft.setTextColor(COLOR_SUCCESS);
    tft.setTextSize(2);
    tft.setCursor(65, 95);
    tft.print("THANH CONG");

    tft.setTextColor(COLOR_TEXT);
    tft.setTextSize(1);
    tft.setCursor(40, 205);
    tft.print("VUI LONG NHAN DO UONG");

    tft.setTextColor(COLOR_SUBTEXT);
    tft.setTextSize(1);
    tft.setCursor(75, 230);
    tft.print("Cam on quy khach!");

    firstRunSuccess = false;
  }

  if (millis() - startTime > 2000) {
    changeState(IDLE);
  }
}
