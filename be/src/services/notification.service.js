const logger = require("../utils/logger");

/**
 * Notification service for queue updates.
 * Currently uses socket.io for real-time push.
 * Can be extended for push notifications (FCM, APNs).
 */
class NotificationService {
  constructor() {
    this.io = null;
  }

  init(io) {
    this.io = io;
    logger.info("Notification service initialized with socket.io");
  }

  notifyTurnReady(machineId, queueId, walletAddress, expiresAt) {
    if (!this.io) return;
    this.io.to(`queue:${machineId}`).emit("turn_ready", {
      machineId,
      queueId,
      walletAddress,
      expiresAt: expiresAt || null,
      message: "It's your turn to make a purchase!",
      timestamp: new Date().toISOString(),
    });
  }

  notifyQueueUpdate(machineId, data) {
    if (!this.io) return;
    this.io.to(`queue:${machineId}`).emit("queue_update", data);
  }

  notifyTurnExpired(machineId, queueId, walletAddress) {
    if (!this.io) return;
    this.io.to(`queue:${machineId}`).emit("turn_expired", {
      machineId,
      queueId,
      walletAddress,
      message: "Your turn has expired. Please rejoin the queue.",
      timestamp: new Date().toISOString(),
    });
  }

  notifyPurchaseComplete(machineId, slot, productName) {
    if (!this.io) return;
    this.io.to(`machine:${machineId}`).emit("purchase_complete", {
      machineId,
      slot,
      productName,
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = new NotificationService();
