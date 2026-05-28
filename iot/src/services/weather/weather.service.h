#pragma once
#include <Arduino.h>

// ===== STRUCT =====
struct WeatherData {
  float temp;
  int humidity;
  int aqi;
  int uv;
  String status;
  bool isValid;
};

// ===== FUNCTION =====
void initWeather();
void updateWeather();
WeatherData getWeather();