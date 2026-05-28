#pragma once
#include <Arduino.h>


// ===== INIT =====
void initMotor();

// ===== CONTROL =====
void motorForward(int motor);
void motorBackward(int motor);
void stopMotor(int motor);

// ===== ACTION =====
void releaseProduct(int slot);
void runAllMotors();