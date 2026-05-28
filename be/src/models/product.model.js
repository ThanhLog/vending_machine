const db = require("../config/firebase");

/**
 * Product/Slot model using Firestore.
 * Stored as subcollection under vending_machines/{machineId}/slots
 * Fields: slot (e.g. "A1"), name, price, priceETH, status
 */
const ProductModel = {
  async findAllByMachine(machineId) {
    const snapshot = await db
      .collection("vending_machines")
      .doc(machineId)
      .collection("slots")
      .orderBy("slot")
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  async findBySlot(machineId, slot) {
    const doc = await db
      .collection("vending_machines")
      .doc(machineId)
      .collection("slots")
      .doc(slot)
      .get();

    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  },

  async upsert(machineId, slot, data) {
    const ref = db
      .collection("vending_machines")
      .doc(machineId)
      .collection("slots")
      .doc(slot);

    await ref.set({ ...data, updatedAt: new Date().toISOString() }, { merge: true });
    const doc = await ref.get();
    return { id: doc.id, ...doc.data() };
  },
};

module.exports = ProductModel;
