#include "time.service.h"
#include <time.h>

// GMT+7
const long gmtOffset_sec = 7 * 3600;
const int daylightOffset_sec = 0;

// ===== INIT =====
void initTime() {
  configTime(gmtOffset_sec, daylightOffset_sec, "pool.ntp.org");

  Serial.println("Syncing time...");

  struct tm timeinfo;
  int retry = 0;

  // chờ NTP sync
  while (!getLocalTime(&timeinfo) && retry < 10) {
    Serial.print(".");
    delay(500);
    retry++;
  }

  if (retry < 10) {
    Serial.println("\nTime synced!");
  } else {
    Serial.println("\n❌ Failed to sync time");
  }
}

// ===== GET HH:MM =====
String getTimeStr() {
  struct tm timeinfo;

  if (!getLocalTime(&timeinfo)) {
    return "--:--";
  }

  char buffer[6];
  sprintf(buffer, "%02d:%02d", timeinfo.tm_hour, timeinfo.tm_min);

  return String(buffer);
}

// ===== GET HH:MM:SS =====
String getFullTime() {
  struct tm timeinfo;

  if (!getLocalTime(&timeinfo)) {
    return "--:--:--";
  }

  char buffer[9];
  sprintf(buffer, "%02d:%02d:%02d", timeinfo.tm_hour, timeinfo.tm_min,
          timeinfo.tm_sec);

  return String(buffer);
}

// ===== GET DATE =====
String getDateStr() {
  struct tm timeinfo;

  if (!getLocalTime(&timeinfo)) {
    return "--/--/----";
  }

  char buffer[11];
  sprintf(buffer, "%02d/%02d/%04d", timeinfo.tm_mday, timeinfo.tm_mon + 1,
          timeinfo.tm_year + 1900);

  return String(buffer);
}