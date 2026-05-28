const db = require("../config/firebase");

/**
 * Firestore CRUD helpers for vending machine operations.
 */

const MACHINES_COLLECTION = "vending_machines";
const SLOTS_COLLECTION = "slots";
const QUEUE_COLLECTION = "queues";

// ---------- Vending Machines ----------

async function getAllMachines() {
  const snapshot = await db.collection(MACHINES_COLLECTION).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function getMachineById(machineId) {
  const doc = await db.collection(MACHINES_COLLECTION).doc(machineId).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

async function upsertMachine(machineId, data) {
  const ref = db.collection(MACHINES_COLLECTION).doc(machineId);
  await ref.set({ ...data, updatedAt: new Date().toISOString() }, { merge: true });
  const doc = await ref.get();
  return { id: doc.id, ...doc.data() };
}

// ---------- Slots ----------

async function getSlots(machineId) {
  const snapshot = await db
    .collection(MACHINES_COLLECTION)
    .doc(machineId)
    .collection(SLOTS_COLLECTION)
    .orderBy("slot")
    .get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function getSlot(machineId, slotNumber) {
  const doc = await db
    .collection(MACHINES_COLLECTION)
    .doc(machineId)
    .collection(SLOTS_COLLECTION)
    .doc(slotNumber)
    .get();

  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

async function updateSlot(machineId, slotNumber, data) {
  const ref = db
    .collection(MACHINES_COLLECTION)
    .doc(machineId)
    .collection(SLOTS_COLLECTION)
    .doc(slotNumber);

  await ref.set({ ...data, updatedAt: new Date().toISOString() }, { merge: true });
  const doc = await ref.get();
  return { id: doc.id, ...doc.data() };
}

// ---------- Queue ----------

async function joinQueue(machineId, walletAddress) {
  const queueRef = db
    .collection(MACHINES_COLLECTION)
    .doc(machineId)
    .collection(QUEUE_COLLECTION);

  // Check if already in queue
  const existingSnapshot = await queueRef
    .where("walletAddress", "==", walletAddress.toLowerCase())
    .where("status", "in", ["waiting", "serving"])
    .get();

  if (!existingSnapshot.empty) {
    const existing = existingSnapshot.docs[0];
    return { id: existing.id, ...existing.data() };
  }

  // Count current waiting queue size
  const waitingSnapshot = await queueRef.where("status", "==", "waiting").get();
  const position = waitingSnapshot.size + 1;

  const entry = {
    walletAddress: walletAddress.toLowerCase(),
    machineId,
    position,
    status: "waiting", // waiting, serving, completed, cancelled, expired
    joinedAt: new Date().toISOString(),
    servingAt: null,
    completedAt: null,
    expiresAt: null,
  };

  const doc = await queueRef.add(entry);
  return { id: doc.id, ...entry };
}

async function getQueueStatus(machineId, queueId) {
  const doc = await db
    .collection(MACHINES_COLLECTION)
    .doc(machineId)
    .collection(QUEUE_COLLECTION)
    .doc(queueId)
    .get();

  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

async function getCurrentServing(machineId) {
  const snapshot = await db
    .collection(MACHINES_COLLECTION)
    .doc(machineId)
    .collection(QUEUE_COLLECTION)
    .where("status", "==", "serving")
    .get();

  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
}

async function getQueuePosition(machineId, walletAddress) {
  const queueRef = db
    .collection(MACHINES_COLLECTION)
    .doc(machineId)
    .collection(QUEUE_COLLECTION);

  // Get the user's entry
  const userSnapshot = await queueRef
    .where("walletAddress", "==", walletAddress.toLowerCase())
    .where("status", "in", ["waiting", "serving"])
    .get();

  if (userSnapshot.empty) return null;

  const userEntry = userSnapshot.docs[0];
  const userData = userEntry.data();

  // Count people ahead (joinedAt earlier, still waiting)
  const aheadSnapshot = await queueRef
    .where("status", "==", "waiting")
    .where("joinedAt", "<", userData.joinedAt)
    .get();

  return {
    queueId: userEntry.id,
    ...userData,
    position: aheadSnapshot.size + 1,
    peopleAhead: aheadSnapshot.size,
  };
}

async function serveNext(machineId) {
  const queueRef = db
    .collection(MACHINES_COLLECTION)
    .doc(machineId)
    .collection(QUEUE_COLLECTION);

  // Find the next waiting entry (earliest joinedAt)
  const snapshot = await queueRef
    .where("status", "==", "waiting")
    .orderBy("joinedAt", "asc")
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  const timeoutSec = require("../config/env").QUEUE_TIMEOUT_SEC;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + timeoutSec * 1000).toISOString();

  await doc.ref.update({
    status: "serving",
    position: 0,
    servingAt: now.toISOString(),
    expiresAt,
  });

  // Recalculate positions for remaining waiting entries
  const remainingSnapshot = await queueRef.where("status", "==", "waiting").orderBy("joinedAt", "asc").get();
  for (let i = 0; i < remainingSnapshot.docs.length; i++) {
    await remainingSnapshot.docs[i].ref.update({ position: i + 1 });
  }

  return { id: doc.id, ...doc.data(), status: "serving", position: 0, servingAt: now.toISOString(), expiresAt };
}

async function completeServing(machineId, queueId) {
  const ref = db
    .collection(MACHINES_COLLECTION)
    .doc(machineId)
    .collection(QUEUE_COLLECTION)
    .doc(queueId);

  await ref.update({
    status: "completed",
    completedAt: new Date().toISOString(),
  });
}

async function expireQueueEntry(machineId, queueId) {
  const ref = db
    .collection(MACHINES_COLLECTION)
    .doc(machineId)
    .collection(QUEUE_COLLECTION)
    .doc(queueId);

  await ref.update({
    status: "expired",
    completedAt: new Date().toISOString(),
  });
}

module.exports = {
  getAllMachines,
  getMachineById,
  upsertMachine,
  getSlots,
  getSlot,
  updateSlot,
  joinQueue,
  getQueueStatus,
  getCurrentServing,
  getQueuePosition,
  serveNext,
  completeServing,
  expireQueueEntry,
};
