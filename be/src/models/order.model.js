const db = require("../config/firebase");

const ORDERS_COLLECTION = "orders";

const OrderModel = {
  async create({ walletAddress, machineId, slot, productName, priceETH, txHash, commandId }) {
    const order = {
      walletAddress: walletAddress.toLowerCase(),
      machineId,
      slot,
      productName,
      priceETH,
      txHash,
      commandId: commandId || null,
      status: "confirmed", // confirmed, dispensed, failed
      createdAt: new Date().toISOString(),
      dispensedAt: null,
    };
    const ref = await db.collection(ORDERS_COLLECTION).add(order);
    return { id: ref.id, ...order };
  },

  async getByWallet(walletAddress, limit = 20) {
    const snapshot = await db
      .collection(ORDERS_COLLECTION)
      .where("walletAddress", "==", walletAddress.toLowerCase())
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  async getByMachine(machineId, limit = 50) {
    const snapshot = await db
      .collection(ORDERS_COLLECTION)
      .where("machineId", "==", machineId)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  async updateStatus(orderId, status) {
    const updateData = {
      status,
      updatedAt: new Date().toISOString(),
    };
    if (status === "dispensed") {
      updateData.dispensedAt = new Date().toISOString();
    }
    await db.collection(ORDERS_COLLECTION).doc(orderId).update(updateData);
  },

  async setCommandId(orderId, commandId) {
    await db.collection(ORDERS_COLLECTION).doc(orderId).update({ commandId });
  },

  async updateDispensed(orderId) {
    await db.collection(ORDERS_COLLECTION).doc(orderId).update({
      status: "dispensed",
      dispensedAt: new Date().toISOString(),
    });
  },
};

module.exports = OrderModel;
