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
#define HEARTBEAT_INTERVAL 10000 // ms (10s - dong bo nhanh hon)

// ===== MOTOR =====
// Thoi gian de motor quay 1 vong. Can hieu chuan theo RPM/tai thuc te.
// Cong thuc tham khao: MOTOR_ONE_REV_MS = 60000 / RPM
#define MOTOR_ONE_REV_MS 3000 // ms (1 vong voi motor khoang 20 RPM)

// ===== PURCHASE TIMEOUT =====
#define PURCHASE_TIMEOUT 180000 // 3 phut - BE quan ly countdown, ESP chi fallback

// ===== SERVO =====
#define SERVO_OPEN_ANGLE 90
#define SERVO_CLOSE_ANGLE 0
#define SERVO_DELAY 3000 // ms

// ===== BUZZER =====
#define BUZZER_TIME 200

// ===== DISPLAY =====
#define SCREEN_WIDTH 240
#define SCREEN_HEIGHT 320
