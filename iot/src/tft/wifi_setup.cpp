#include "tft.h"
#include "colors.h"
#include "config.h"
#include <WiFi.h>

void drawWifiSetup() {
  static bool firstRun = true;
  static unsigned long lastBlink = 0;
  static bool blinkOn = true;
  static int lastClients = -1;

  if (uiStateChanged) {
    firstRun = true;
    lastBlink = 0;
    blinkOn = true;
    lastClients = -1;
  }

  // 1. VE KHUNG CO DINH
  if (firstRun) {
    tft.fillScreen(COLOR_BG);

    // Header
    tft.fillRoundRect(5, 5, 230, 50, 12, COLOR_CARD);
    tft.setTextColor(COLOR_ACCENT);
    tft.setTextSize(2);
    tft.setCursor(45, 22);
    tft.print("WIFI SETUP");

    // Info card
    tft.fillRoundRect(20, 70, 200, 150, 15, COLOR_CARD);

    tft.setTextColor(COLOR_TEXT);
    tft.setTextSize(2);
    tft.setCursor(35, 90);
    tft.print("Connect to WiFi:");

    // SSID box
    tft.fillRoundRect(30, 115, 180, 32, 8, COLOR_BG);
    tft.setTextColor(COLOR_ACCENT);
    tft.setTextSize(2);
    tft.setCursor(50, 123);
    tft.print(AP_SSID);

    // Password
    tft.setTextColor(COLOR_SUBTEXT);
    tft.setTextSize(1);
    tft.setCursor(35, 160);
    tft.print("Password: ");
    tft.setTextColor(COLOR_TEXT);
    tft.print(AP_PASS);

    // IP
    tft.setTextColor(COLOR_SUBTEXT);
    tft.setCursor(35, 178);
    tft.print("Or open: http://");
    tft.setTextColor(COLOR_ACCENT);
    tft.print("192.168.4.1");

    // Footer instruction
    tft.setTextColor(COLOR_SUBTEXT);
    tft.setTextSize(1);
    tft.setCursor(30, 250);
    tft.print("Cau hinh WiFi khu vuc");
    tft.setCursor(45, 265);
    tft.print("de ket noi Internet");

    firstRun = false;
  }

  // 2. CAP NHAT SO CLIENT + TRANG THAI
  int clients = WiFi.softAPgetStationNum();

  if (clients != lastClients) {
    // Xoa vung cu
    tft.fillRect(35, 205, 170, 18, COLOR_BG);
    tft.setTextColor(COLOR_TEXT);
    tft.setTextSize(1);
    tft.setCursor(50, 207);

    if (clients > 0) {
      tft.print("Thiet bi da ket noi: ");
      tft.setTextColor(COLOR_SUCCESS);
      tft.print(clients);
    } else {
      tft.print("Dang cho thiet bi ket noi...");
    }
    lastClients = clients;
  }

  // 3. BLINKING DOT (cho thay dang hoat dong)
  if (millis() - lastBlink > 600) {
    lastBlink = millis();
    blinkOn = !blinkOn;

    tft.fillCircle(220, 300, 4, blinkOn ? COLOR_ACCENT : COLOR_BG);
  }
}
