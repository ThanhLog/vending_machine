#pragma once
#include <Arduino.h>

void initBackend();
void processBackendCommands();
void sendHeartbeat();
bool hasPendingCommand();
const char *getPendingCommandId();
int getPendingSlot();
int getPendingOrderNumber();
void reportSuccess();
void reportError(const String &msg);
bool isMachineResting();
const char *getMachineMode();
int getBeOrderNumber();
int getBeRemainingSeconds();
bool hasBeServing();
