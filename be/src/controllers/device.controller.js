const firebaseService = require("../services/firebase.service");
const { success, error } = require("../utils/response");
const logger = require("../utils/logger");

// POST /api/device/machine
async function registerMachine(req, res) {
  try {
    const { id, name, location, latitude, longitude, isOnline, temperature, mode } = req.body;
    if (!id || !name) return error(res, "id and name are required", 400);

    const machine = await firebaseService.upsertMachine(id, {
      name,
      location: location || "",
      latitude: latitude || 21.0288,
      longitude: longitude || 105.854,
      isOnline: isOnline ?? true,
      temperature: temperature || 5.0,
      products: 0,
      mode: mode || "normal",
    });
    return success(res, machine, "Machine registered", 201);
  } catch (err) {
    logger.error("registerMachine:", err.message);
    return error(res, err.message);
  }
}

// PUT /api/device/machine/:id
async function updateMachine(req, res) {
  try {
    const machine = await firebaseService.upsertMachine(req.params.id, req.body);
    return success(res, machine);
  } catch (err) {
    logger.error("updateMachine:", err.message);
    return error(res, err.message);
  }
}

// POST /api/device/machine/:id/slots
async function updateSlot(req, res) {
  try {
    const { slot, name, price, priceETH, status } = req.body;
    if (!slot) return error(res, "slot is required", 400);

    const slotData = await firebaseService.updateSlot(req.params.id, slot, {
      name: name || "",
      price: price || "",
      priceETH: priceETH || 0.001,
      status: status || "available",
    });
    return success(res, slotData);
  } catch (err) {
    logger.error("updateSlot:", err.message);
    return error(res, err.message);
  }
}

// GET /api/device/machine/:id/slots
async function getSlots(req, res) {
  try {
    const slots = await firebaseService.getSlots(req.params.id);
    return success(res, slots);
  } catch (err) {
    logger.error("getSlots:", err.message);
    return error(res, err.message);
  }
}

module.exports = { registerMachine, updateMachine, updateSlot, getSlots };
