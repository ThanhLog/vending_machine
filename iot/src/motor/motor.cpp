#include "motor.h"
#include "pins.h"

struct MotorPins {
  int a;
  int b;
};

MotorPins motors[] = {
    // Cell A1
    {M1A, M1B},
    // Cell A2
    {M2A, M2B},
    // Cell A3
    {M3A, M3B},
    // Cell B1
    {M4A, M4B}};

// ===== INIT =====
void initMotor() {

  for (int i = 0; i < 4; i++) {

    pinMode(motors[i].a, OUTPUT);
    pinMode(motors[i].b, OUTPUT);

    digitalWrite(motors[i].a, LOW);
    digitalWrite(motors[i].b, LOW);
  }
}

// ===== FORWARD =====
void motorForward(int id) {

  id--;

  digitalWrite(motors[id].a, HIGH);
  digitalWrite(motors[id].b, LOW);
}

// ===== BACKWARD =====
void motorBackward(int id) {

  id--;

  digitalWrite(motors[id].a, LOW);
  digitalWrite(motors[id].b, HIGH);
}

// ===== STOP =====
void stopMotor(int id) {

  id--;

  digitalWrite(motors[id].a, LOW);
  digitalWrite(motors[id].b, LOW);
}

// ===== RUN ALL =====
void runAllMotors() {

  for (int i = 0; i < 4; i++) {

    digitalWrite(motors[i].a, HIGH);
    digitalWrite(motors[i].b, LOW);
  }
}