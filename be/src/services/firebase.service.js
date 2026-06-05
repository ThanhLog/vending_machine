const db = require("../config/firebase");

/**
 * Firestore CRUD helpers for vending machine operations.
 */

const MACHINES_COLLECTION = "vending_machines";
const SLOTS_COLLECTION = "slots";
const QUEUE_COLLECTION = "queues";
const ORDERS_COLLECTION = "orders";

// ---------- Vending Machines ----------

async function getAllMachines() {
  const snapshot = await db.collection(MACHINES_COLLECTION).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function getMachineById(machineId) {
  const doc = await db.collection(MACHINES_COLLECTION).doc(machineId).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

async function deleteMachine(machineId) {
  await db.collection(MACHINES_COLLECTION).doc(machineId).delete();
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

  // Check if already in queue (filter status in code to avoid composite index)
  const existingSnapshot = await queueRef
    .where("walletAddress", "==", walletAddress.toLowerCase())
    .get();

  if (!existingSnapshot.empty) {
    const existing = existingSnapshot.docs.find((d) =>
      ["waiting", "serving"].includes(d.data().status)
    );
    if (existing) {
      return { id: existing.id, ...existing.data() };
    }
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

  // Get the user's entry (filter status in code)
  const userSnapshot = await queueRef
    .where("walletAddress", "==", walletAddress.toLowerCase())
    .get();

  if (userSnapshot.empty) return null;

  const userDoc = userSnapshot.docs.find((d) =>
    ["waiting", "serving"].includes(d.data().status)
  );
  if (!userDoc) return null;

  const userData = userDoc.data();

  // Count people ahead: all waiting entries with joinedAt earlier
  const waitingSnapshot = await queueRef
    .where("status", "==", "waiting")
    .get();

  // Count waiting people ahead
  const aheadWaiting = waitingSnapshot.docs.filter((d) =>
    d.data().joinedAt < userData.joinedAt
  ).length;

  // Check if someone is currently being served
  let servingAhead = 0;
  if (userData.status === "waiting") {
    const currentServing = await getCurrentServing(machineId);
    if (currentServing) {
      servingAhead = 1; // The person being served is ahead of all waiting
    }
  }

  const totalAhead = aheadWaiting + servingAhead;

  return {
    queueId: userDoc.id,
    ...userData,
    position: totalAhead + 1,
    peopleAhead: totalAhead,
  };
}

async function serveNext(machineId) {
  const queueRef = db
    .collection(MACHINES_COLLECTION)
    .doc(machineId)
    .collection(QUEUE_COLLECTION);

  // Find the next waiting entry (earliest joinedAt)
  // Sử dụng where đơn giản + sort thủ công để tránh cần composite index
  const snapshot = await queueRef
    .where("status", "==", "waiting")
    .get();

  if (snapshot.empty) return null;

  // Sort by joinedAt manually
  const docs = snapshot.docs.map((doc) => ({ doc, ...doc.data() }));
  docs.sort((a, b) => {
    const timeA = a.joinedAt ? new Date(a.joinedAt).getTime() : 0;
    const timeB = b.joinedAt ? new Date(b.joinedAt).getTime() : 0;
    return timeA - timeB;
  });

  const first = docs[0];
  const firstDoc = first.doc;
  const firstData = firstDoc.data();
  const timeoutSec = require("../config/env").QUEUE_TIMEOUT_SEC;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + timeoutSec * 1000).toISOString();

  await firstDoc.ref.update({
    status: "serving",
    position: 0,
    servingAt: now.toISOString(),
    expiresAt,
  });

  // Recalculate positions for remaining waiting entries
  for (let i = 1; i < docs.length; i++) {
    await docs[i].doc.ref.update({ position: i + 1 });
  }

  return { id: firstDoc.id, ...firstData, status: "serving", position: 0, servingAt: now.toISOString(), expiresAt };
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

async function incrementOrderCounter(machineId) {
  const ref = db.collection(MACHINES_COLLECTION).doc(machineId);
  const doc = await ref.get();
  if (!doc.exists) {
    // Create machine with counter = 1
    await ref.set({ orderCounter: 1, updatedAt: new Date().toISOString() });
    return 1;
  }
  const data = doc.data();
  const current = data.orderCounter || 0;
  const next = current + 1;
  await ref.update({ orderCounter: next, updatedAt: new Date().toISOString() });
  return next;
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

// ---------- Orders ----------

async function getOrders({ machineId, status, page, limit } = {}) {
  let query = db.collection(ORDERS_COLLECTION);

  if (machineId) {
    query = query.where("machineId", "==", machineId);
  }
  if (status) {
    query = query.where("status", "==", status);
  }

  // Get total count (approximate via snapshot size for simple queries)
  const countSnapshot = await query.get();
  const total = countSnapshot.size;

  // Apply ordering and pagination
  let dataQuery = query.orderBy("createdAt", "desc");

  if (page && limit) {
    const offset = (page - 1) * limit;
    // Use offset-based pagination
    // Get all and slice since Firestore doesn't support offset natively
    const snapshot = await dataQuery.limit(page * limit).get();
    const allDocs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const paginatedDocs = allDocs.slice(offset, offset + limit);
    return {
      orders: paginatedDocs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  const snapshot = await dataQuery.limit(limit || 50).get();
  return {
    orders: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    total,
    page: 1,
    limit: limit || 50,
    totalPages: 1,
  };
}

async function getOrderStats() {
  const snapshot = await db.collection(ORDERS_COLLECTION).get();
  const orders = snapshot.docs.map((doc) => doc.data());

  const total = orders.length;
  const confirmed = orders.filter((o) => o.status === "confirmed").length;
  const dispensed = orders.filter((o) => o.status === "dispensed").length;
  const failed = orders.filter((o) => o.status === "failed").length;

  // Total revenue in ETH
  const totalETH = orders
    .filter((o) => o.status !== "failed")
    .reduce((sum, o) => sum + (parseFloat(o.priceETH) || 0), 0);

  return { total, confirmed, dispensed, failed, totalETH };
}

async function updateOrderStatus(orderId, status) {
  const updateData = {
    status,
    updatedAt: new Date().toISOString(),
  };
  if (status === "dispensed") {
    updateData.dispensedAt = new Date().toISOString();
  }
  await db.collection(ORDERS_COLLECTION).doc(orderId).update(updateData);
}

module.exports = {
  getAllMachines,
  getMachineById,
  upsertMachine,
  deleteMachine,
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
  incrementOrderCounter,
  getOrders,
  getOrderStats,
  updateOrderStatus,
};
