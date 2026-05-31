const commandService = require("../services/command.service");
const { success, error } = require("../utils/response");
const logger = require("../utils/logger");

// GET /api/command/machine/:id/pending
async function getPendingCommands(req, res) {
  try {
    const firebaseService = require("../services/firebase.service");
    const commands = await commandService.getPendingCommands(req.params.id);
    // Always include current orderNumber so ESP32 stays in sync
    const machine = await firebaseService.getMachineById(req.params.id);
    const orderNumber = machine ? (machine.orderCounter || 0) : 0;
    return success(res, { commands, orderNumber });
  } catch (err) {
    logger.error("getPendingCommands:", err.message);
    return error(res, err.message);
  }
}

// PUT /api/command/machine/:id/command/:cmdId/status
async function updateCommandStatus(req, res) {
  try {
    const { status, errorMessage } = req.body;

    if (!status || !["processing", "completed", "failed"].includes(status)) {
      return error(res, "status must be one of: processing, completed, failed", 400);
    }

    // Get command first to know which slot
    const command = await commandService.getCommand(req.params.id, req.params.cmdId);
    if (!command) return error(res, "Command not found", 404);

    const updated = await commandService.updateCommandStatus(
      req.params.id,
      req.params.cmdId,
      status,
      errorMessage || null
    );

    // ── Update slot based on dispense result ──────────
    const firebaseService = require("../services/firebase.service");
    const slot = command.slot;

    if (status === "completed") {
      // Dispense successful → decrease quantity
      const slotData = await firebaseService.getSlot(req.params.id, slot);
      if (slotData) {
        const currentQty = slotData.quantity != null ? slotData.quantity : 1;
        const newQty = currentQty - 1;
        const update = { status: newQty <= 0 ? "empty" : "available", quantity: newQty };
        await firebaseService.updateSlot(req.params.id, slot, update);
        logger.info("Slot", slot, "dispensed, qty:", newQty);

        // Check if machine is now empty (dispensing still counts as available)
        const allSlots = await firebaseService.getSlots(req.params.id);
        const hasAvailable = allSlots.some((s) =>
          (s.status === "available" || s.status === "dispensing") &&
          (s.quantity == null || s.quantity > 0)
        );
        if (!hasAvailable) {
          await firebaseService.upsertMachine(req.params.id, { mode: "rest", isOnline: false });
          logger.info("Machine", req.params.id, "set to REST mode");
        } else {
          // Ensure machine is NOT in rest mode when slots are available
          await firebaseService.upsertMachine(req.params.id, { mode: "normal", isOnline: true });
        }
      }
    } else if (status === "failed") {
      // Dispense failed → revert slot back to available
      await firebaseService.updateSlot(req.params.id, slot, { status: "available" });
      logger.info("Slot", slot, "reverted to available (dispense failed)");
    }

    return success(res, updated);
  } catch (err) {
    logger.error("updateCommandStatus:", err.message);
    return error(res, err.message);
  }
}

// GET /api/command/machine/:id/command/:cmdId
async function getCommand(req, res) {
  try {
    const command = await commandService.getCommand(req.params.id, req.params.cmdId);
    if (!command) return error(res, "Command not found", 404);
    return success(res, command);
  } catch (err) {
    logger.error("getCommand:", err.message);
    return error(res, err.message);
  }
}

module.exports = { getPendingCommands, updateCommandStatus, getCommand };
