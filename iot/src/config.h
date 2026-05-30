#pragma once

// ===== SYSTEM =====
#define DEBUG true

// ===== WIFI =====
#define WIFI_TIMEOUT 10000 // ms
#define AP_SSID "Vending_Setup"
#define AP_PASS "12345678"

// ===== BACKEND =====
#define BACKEND_URL "https://apivendingmachine.thiephaoy.shop"
#define MACHINE_ID "machine-hanoi-05"
#define MACHINE_NAME "May Ban Hang Hanoi-05"
#define POLL_INTERVAL 2000    // ms
#define HEARTBEAT_INTERVAL 30000 // ms

// ===== MOTOR =====
#define MOTOR_TIMEOUT 3000 // ms

// ===== PURCHASE TIMEOUT =====
#define PURCHASE_TIMEOUT 300000 // 5 phut - sau thoi gian nay auto skip luot mua

// ===== SERVO =====
#define SERVO_OPEN_ANGLE 90
#define SERVO_CLOSE_ANGLE 0
#define SERVO_DELAY 3000 // ms

// ===== SENSOR =====
#define IR_TRIGGER LOW
#define IR_DEBOUNCE_TIME 60 // ms

// ===== BUZZER =====
#define BUZZER_TIME 200

// ===== DISPLAY =====
#define SCREEN_WIDTH 240
#define SCREEN_HEIGHT 320
