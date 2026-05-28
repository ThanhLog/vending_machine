#pragma once
#include <Arduino.h>

// ===== INIT =====
void initTime();

// ===== GET =====
String getTimeStr();
String getFullTime(); // HH:MM:SS
String getDateStr();  // DD/MM/YYYY