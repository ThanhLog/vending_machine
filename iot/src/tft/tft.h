#pragma once
#include <Adafruit_GFX.h>
#include <Adafruit_ST7789.h>

// ===== COLOR =====
extern uint16_t BG_COLOR;
extern uint16_t PRIMARY;
extern uint16_t ACCENT;
extern uint16_t TEXT_COLOR;
extern uint16_t SUCCESS_COLOR;
extern uint16_t ERROR_COLOR;

// ===== TFT =====
extern Adafruit_ST7789 tft;

// ===== STATE =====
enum UIState { WIFI_SETUP, IDLE, SELECT, PROCESSING, SUCCESS, ERROR_STATE };

extern UIState currentState;
extern bool uiStateChanged;

// ===== NOTIFICATION =====
void setNotification(const char* msg);
void clearNotification();
bool hasNotification();
const char* getNotificationMsg();

// ===== CORE =====
void initTFT();
void drawUI();
void changeState(UIState newState);

// ===== SCREEN =====
void drawWifiSetup();
void drawIdle();
void drawSelect();
void drawProcessing();
void drawSuccess();
void drawError();
