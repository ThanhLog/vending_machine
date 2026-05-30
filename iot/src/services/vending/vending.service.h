#pragma once

enum VendingStatus {
  VENDING_READY,
  VENDING_PROCESSING,
  VENDING_SUCCESS,
  VENDING_ERROR
};

void initVending();
bool selectProduct(int slot);
bool executeRemoteCommand(int slot, int orderNumber, const char *commandId);
void updateVending();
VendingStatus getVendingStatus();
const char *getVendingStatusText();
int getCurrentOrderNumber();
bool isProductDetected();
void resetOrderNumber();
