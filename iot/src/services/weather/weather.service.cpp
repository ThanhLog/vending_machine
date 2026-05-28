#include "weather.service.h"
#include <ArduinoJson.h>
#include <HTTPClient.h>
#include <WiFi.h>

// ===== GLOBAL =====
static WeatherData weather;

static unsigned long lastUpdate = 0;
const unsigned long UPDATE_INTERVAL = 60000; // 60s

String city = "Hanoi,VN";
String apiKey = "YOUR_API_KEY";

// ===== INIT =====
void initWeather() { weather = {0, 0, 0, 0, "Loading...", false}; }

// ===== FETCH WEATHER =====
void fetchWeatherMain() {

  if (WiFi.status() != WL_CONNECTED)
    return;

  HTTPClient http;

  String url = "http://api.openweathermap.org/data/2.5/weather?q=" + city +
               "&appid=" + apiKey + "&units=metric";

  http.begin(url);
  http.setTimeout(1000); // ⚡ nhanh

  Serial.println("==== CALL WEATHER API ====");

  int httpCode = http.GET();

  Serial.print("HTTP CODE: ");
  Serial.println(httpCode);

  if (httpCode == 200) {

    String payload = http.getString(); // ✅ chỉ gọi 1 lần

    Serial.println("RESPONSE:");
    Serial.println(payload);

    JsonDocument doc;
    DeserializationError err = deserializeJson(doc, payload);

    if (!err) {
      weather.temp = doc["main"]["temp"] | 0;
      weather.humidity = doc["main"]["humidity"] | 0;
      weather.status = doc["weather"][0]["main"].as<String>();
      weather.isValid = true;
    } else {
      Serial.println("JSON ERROR");
      weather.isValid = false;
    }

  } else {
    weather.isValid = false;
  }

  http.end();
}

// ===== UPDATE =====
void updateWeather() {

  // chạy ngay lần đầu + mỗi 60s
  if (lastUpdate == 0 || millis() - lastUpdate >= UPDATE_INTERVAL) {

    lastUpdate = millis();

    Serial.println("===== FETCH WEATHER =====");

    fetchWeatherMain();

    // demo
    weather.uv = random(1, 11);
    weather.aqi = random(1, 5);

    if (weather.isValid) {
      Serial.println("---- WEATHER DATA ----");
      Serial.print("Temp: ");
      Serial.println(weather.temp);
      Serial.print("Humidity: ");
      Serial.println(weather.humidity);
      Serial.print("Status: ");
      Serial.println(weather.status);
    } else {
      Serial.println("❌ Weather failed");
    }

    Serial.println("======================");
  }
}

// ===== GET =====
WeatherData getWeather() { return weather; }
