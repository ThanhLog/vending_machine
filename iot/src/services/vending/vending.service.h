#pragma once

enum VendingStatus {
  VENDING_READY,
  VENDING_PROCESSING,
  VENDING_SUCCESS,
  VENDING_ERROR
};

void initVending();
bool executeRemoteCommand(int slot, int orderNumber, const char *commandId);
void updateVending();
VendingStatus getVendingStatus();
const char *getVendingStatusText();
int getCurrentOrderNumber();
void resetOrderNumber();
void resetIdleTimer();
void checkPurchaseTimeout();
unsigned long getIdleRemaining();
void syncOrderNumberFromBe();
void setVendingReady();
