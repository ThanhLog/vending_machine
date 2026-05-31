const vendingService = require("../services/vending.service");
const { success, error } = require("../utils/response");
const logger = require("../utils/logger");

// GET /api/vending
async function listMachines(req, res) {
  try {
    const { lat, lng } = req.query;
    const machines = await vendingService.listMachines(
      lat ? parseFloat(lat) : null,
      lng ? parseFloat(lng) : null
    );
    return success(res, machines);
  } catch (err) {
    logger.error("listMachines:", err.message);
    return error(res, err.message);
  }
}

// GET /api/vending/:id
async function getMachine(req, res) {
  try {
    const detail = await vendingService.getMachineDetail(req.params.id);
    if (!detail) return error(res, "Machine not found", 404);
    return success(res, detail);
  } catch (err) {
    logger.error("getMachine:", err.message);
    return error(res, err.message);
  }
}

// POST /api/vending/:id/connect
async function connectMachine(req, res) {
  try {
    const { walletAddress } = req.body;
    if (!walletAddress) return error(res, "walletAddress is required", 400);

    const result = await vendingService.connectToMachine(req.params.id, walletAddress);
    return success(res, result, "Joined queue successfully", 201);
  } catch (err) {
    logger.error("connectMachine:", err.message);
    return error(res, err.message, 400);
  }
}

// GET /api/vending/:id/queue/status
async function queueStatus(req, res) {
  try {
    const { walletAddress } = req.query;
    if (!walletAddress) return error(res, "walletAddress query param is required", 400);

    const status = await vendingService.checkQueueStatus(req.params.id, walletAddress);
    if (!status) return error(res, "Not in queue for this machine", 404);
    return success(res, status);
  } catch (err) {
    logger.error("queueStatus:", err.message);
    return error(res, err.message);
  }
}

// POST /api/vending/:id/serve-next (called by machine/ESP32 or admin)
async function serveNext(req, res) {
  try {
    const firebaseService = require("../services/firebase.service");
    const notificationService = require("../services/notification.service");

    const next = await firebaseService.serveNext(req.params.id);
    if (!next) return error(res, "No one in queue", 404);

    notificationService.notifyTurnReady(req.params.id, next.id, next.walletAddress, next.expiresAt);
    notificationService.notifyQueueUpdate(req.params.id, {
      currentServing: next.walletAddress,
      remainingInQueue: "recalculated",
    });

    return success(res, next, "Next person served");
  } catch (err) {
    logger.error("serveNext:", err.message);
    return error(res, err.message);
  }
}

// POST /api/vending/:id/finish-shopping
async function finishShopping(req, res) {
  try {
    const { walletAddress } = req.body;
    if (!walletAddress) return error(res, "walletAddress is required", 400);

    const result = await vendingService.finishShopping(req.params.id, walletAddress);
    return success(res, result, "Shopping finished");
  } catch (err) {
    logger.error("finishShopping:", err.message);
    return error(res, err.message, 400);
  }
}

module.exports = { listMachines, getMachine, connectMachine, queueStatus, serveNext, finishShopping };
