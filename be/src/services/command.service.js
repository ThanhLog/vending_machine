const db = require("../config/firebase");
const logger = require("../utils/logger");

const MACHINES_COLLECTION = "vending_machines";
const COMMANDS_COLLECTION = "commands";

async function createCommand(machineId, { slot, orderId, productName, queueId }) {
  const command = {
    slot,
    orderId,
    productName,
    queueId,
    status: "pending",
    createdAt: new Date().toISOString(),
    startedAt: null,
    completedAt: null,
    errorMessage: null,
  };

  const ref = await db
    .collection(MACHINES_COLLECTION)
    .doc(machineId)
    .collection(COMMANDS_COLLECTION)
    .add(command);

  logger.info("Command created:", ref.id, "machine:", machineId, "slot:", slot);
  return { id: ref.id, machineId, ...command };
}

async function getPendingCommands(machineId) {
  const snapshot = await db
    .collection(MACHINES_COLLECTION)
    .doc(machineId)
    .collection(COMMANDS_COLLECTION)
    .where("status", "==", "pending")
    .orderBy("createdAt", "asc")
    .limit(5)
    .get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function getCommand(machineId, commandId) {
  const doc = await db
    .collection(MACHINES_COLLECTION)
    .doc(machineId)
    .collection(COMMANDS_COLLECTION)
    .doc(commandId)
    .get();

  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

async function updateCommandStatus(machineId, commandId, status, errorMessage = null) {
  const updateData = { status, updatedAt: new Date().toISOString() };

  if (status === "processing") {
    updateData.startedAt = new Date().toISOString();
  }

  if (status === "completed" || status === "failed") {
    updateData.completedAt = new Date().toISOString();
  }

  if (errorMessage) {
    updateData.errorMessage = errorMessage;
  }

  const ref = db
    .collection(MACHINES_COLLECTION)
    .doc(machineId)
    .collection(COMMANDS_COLLECTION)
    .doc(commandId);

  await ref.update(updateData);
  logger.info("Command updated:", commandId, "status:", status);

  const doc = await ref.get();
  return { id: doc.id, ...doc.data() };
}

module.exports = {
  createCommand,
  getPendingCommands,
  getCommand,
  updateCommandStatus,
};
