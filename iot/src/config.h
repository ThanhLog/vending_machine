#pragma once

// ===== SYSTEM =====
#define DEBUG true

// ===== WIFI =====
#define WIFI_TIMEOUT 10000 // ms
#define AP_SSID "Vending_Setup"
#define AP_PASS "12345678"

// ===== BACKEND =====
#define BACKEND_URL "http://192.168.1.100:3000"
#define MACHINE_ID "vending_01"
#define POLL_INTERVAL 2000    // ms
#define HEARTBEAT_INTERVAL 30000 // ms

// ===== MOTOR =====
#define MOTOR_TIMEOUT 3000 // ms

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
