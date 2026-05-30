const firebaseService = require("./firebase.service");
const blockchainService = require("./blockchain.service");
const OrderModel = require("../models/order.model");
const UserModel = require("../models/user.model");
const env = require("../config/env");
const logger = require("../utils/logger");

/**
 * Get all machines with optional distance calculation from user coordinates.
 */
async function listMachines(userLat, userLng) {
  const machines = await firebaseService.getAllMachines();

  if (userLat != null && userLng != null) {
    const radiusKm = env.PROXIMITY_RADIUS_M / 1000; // convert meters to km
    return machines
      .map((m) => ({
        ...m,
        distance: calculateDistance(userLat, userLng, m.latitude, m.longitude),
      }))
      .filter((m) => m.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);
  }

  return machines;
}

/**
 * Get machine details with all slots.
 */
async function getMachineDetail(machineId) {
  const machine = await firebaseService.getMachineById(machineId);
  if (!machine) return null;

  const slots = await firebaseService.getSlots(machineId);
  return { ...machine, slots };
}

/**
 * Join a queue for a machine.
 */
async function connectToMachine(machineId, walletAddress) {
  const machine = await firebaseService.getMachineById(machineId);
  if (!machine) {
    throw new Error("Machine not found");
  }

  if (!machine.isOnline) {
    throw new Error("Machine is offline");
  }

  const entry = await firebaseService.joinQueue(machineId, walletAddress);

  // Nếu chưa có ai đang được phục vụ, tự động serve người đầu tiên
  const currentServing = await firebaseService.getCurrentServing(machineId);
  if (!currentServing) {
    await firebaseService.serveNext(machineId);
    logger.info("Auto-served first user in queue:", walletAddress);
  }

  // Get position
  const position = await firebaseService.getQueuePosition(machineId, walletAddress);

  return {
    queueId: entry.id,
    machineId,
    machineName: machine.name,
    position: position ? position.position : entry.position,
    status: position ? position.status : entry.status,
    peopleAhead: position ? position.peopleAhead : entry.position - 1,
    estimatedWaitMin: position ? position.peopleAhead * 1.5 : 0,
    joinedAt: entry.joinedAt,
  };
}

/**
 * Check queue status for a user.
 */
async function checkQueueStatus(machineId, walletAddress) {
  const position = await firebaseService.getQueuePosition(machineId, walletAddress);
  if (!position) return null;

  return {
    queueId: position.queueId,
    machineId,
    position: position.position,
    status: position.status,
    peopleAhead: position.peopleAhead,
    estimatedWaitMin: position.peopleAhead * 1.5,
    joinedAt: position.joinedAt,
    servingAt: position.servingAt,
    expiresAt: position.expiresAt,
  };
}

/**
 * Process a purchase: verify payment, update slot, create order.
 */
async function processPurchase({ machineId, slot, productName, txHash, walletAddress }) {
  // Verify the machine exists
  const machine = await firebaseService.getMachineById(machineId);
  if (!machine) {
    throw new Error("Machine not found");
  }

  // Check user is currently being served
  const serving = await firebaseService.getCurrentServing(machineId);
  if (!serving || serving.walletAddress !== walletAddress.toLowerCase()) {
    throw new Error("Not your turn. Please wait for your turn to purchase.");
  }

  // Check expiry
  if (serving.expiresAt && new Date(serving.expiresAt) < new Date()) {
    await firebaseService.expireQueueEntry(machineId, serving.id);
    throw new Error("Your turn has expired. Please rejoin the queue.");
  }

  // Verify slot exists and is available
  const slotData = await firebaseService.getSlot(machineId, slot);
  if (!slotData) {
    throw new Error(`Slot ${slot} not found`);
  }

  if (slotData.status !== "available") {
    throw new Error(`Slot ${slot} is not available (status: ${slotData.status})`);
  }

  // Verify blockchain payment
  const expectedPrice = slotData.priceETH || env.PRODUCT_PRICE_ETH;
  const verification = await blockchainService.verifyPayment(txHash, expectedPrice);

  if (!verification.valid) {
    throw new Error(`Payment verification failed: ${verification.reason}`);
  }

  // Check sender matches wallet
  if (verification.from.toLowerCase() !== walletAddress.toLowerCase()) {
    throw new Error(`Payment sender ${verification.from} does not match wallet ${walletAddress}`);
  }

  // Mark slot as sold temporarily
  await firebaseService.updateSlot(machineId, slot, { status: "sold" });

  // Create order record
  const order = await OrderModel.create({
    walletAddress,
    machineId,
    slot,
    productName: slotData.name || productName,
    priceETH: expectedPrice,
    txHash,
    commandId: null,
  });

  // Create dispense command for ESP32
  const commandService = require("./command.service");
  const command = await commandService.createCommand(machineId, {
    slot,
    orderId: order.id,
    productName: slotData.name || productName,
    queueId: serving.id,
  });

  // Update order with commandId
  await OrderModel.setCommandId(order.id, command.id);
  order.commandId = command.id;

  // Update user stats
  await UserModel.addPurchase(walletAddress, expectedPrice);

  // Complete queue serving
  await firebaseService.completeServing(machineId, serving.id);

  // Serve next in queue
  const next = await firebaseService.serveNext(machineId);
  if (next) {
    const notificationService = require("./notification.service");
    notificationService.notifyTurnReady(machineId, next.id, next.walletAddress, next.expiresAt);
  }

  logger.info("Purchase completed:", order.id, "slot:", slot, "by:", walletAddress, "command:", command.id);
  return order;
}

/**
 * Get purchase history for a wallet.
 */
async function getPurchaseHistory(walletAddress) {
  return OrderModel.getByWallet(walletAddress);
}

// Haversine distance in km
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

module.exports = {
  listMachines,
  getMachineDetail,
  connectToMachine,
  checkQueueStatus,
  processPurchase,
  getPurchaseHistory,
};
