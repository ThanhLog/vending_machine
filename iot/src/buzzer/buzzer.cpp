#include "buzzer.h"
#include "pins.h"
#include <Arduino.h>

namespace {
constexpr int BUZZER_CHANNEL = 0;
constexpr int BUZZER_RESOLUTION = 8;

struct BuzzerStep {
  int frequency;
  unsigned long duration;
};

const BuzzerStep SUCCESS_PATTERN[] = {
    {1800, 120},
    {0, 80},
    {2400, 160},
};

const BuzzerStep ERROR_PATTERN[] = {
    {500, 180},
    {0, 80},
    {500, 180},
    {0, 80},
    {350, 260},
};

const BuzzerStep STARTUP_PATTERN[] = {
    {1800, 120},
    {0, 100},
    {1800, 120},
    {0, 100},
    {1800, 120},
};

const BuzzerStep *currentPattern = nullptr;
int patternLength = 0;
int currentStep = 0;
unsigned long stepStartedAt = 0;
bool isPlaying = false;

void startStep() {
  if (!isPlaying || currentStep >= patternLength) {
    ledcWriteTone(BUZZER_CHANNEL, 0);
    isPlaying = false;
    return;
  }

  ledcWriteTone(BUZZER_CHANNEL, currentPattern[currentStep].frequency);
  stepStartedAt = millis();
}

void playPattern(const BuzzerStep *pattern, int length) {
  currentPattern = pattern;
  patternLength = length;
  currentStep = 0;
  isPlaying = true;
  startStep();
}
} // namespace

void initBuzzer() {
  ledcSetup(BUZZER_CHANNEL, 2000, BUZZER_RESOLUTION);
  ledcAttachPin(BUZZER_PIN, BUZZER_CHANNEL);
  ledcWriteTone(BUZZER_CHANNEL, 0);
}

void updateBuzzer() {
  if (!isPlaying)
    return;

  if (millis() - stepStartedAt >= currentPattern[currentStep].duration) {
    currentStep++;
    startStep();
  }
}

void playStartupBuzzer() {
  playPattern(STARTUP_PATTERN, sizeof(STARTUP_PATTERN) / sizeof(BuzzerStep));
}

void playSuccessBuzzer() {
  playPattern(SUCCESS_PATTERN, sizeof(SUCCESS_PATTERN) / sizeof(BuzzerStep));
}

void playErrorBuzzer() {
  playPattern(ERROR_PATTERN, sizeof(ERROR_PATTERN) / sizeof(BuzzerStep));
}
