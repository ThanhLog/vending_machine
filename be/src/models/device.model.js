const db = require("../config/firebase");

const COLLECTION = "vending_machines";

/**
 * Vending machine model using Firestore.
 * Fields: id, name, location, latitude, longitude, isOnline, products, temperature, mode
 */
const DeviceModel = {
  async findAll() {
    const snapshot = await db.collection(COLLECTION).get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  async findById(id) {
    const doc = await db.collection(COLLECTION).doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  },

  async upsert(id, data) {
    const ref = db.collection(COLLECTION).doc(id);
    await ref.set({ ...data, updatedAt: new Date().toISOString() }, { merge: true });
    const doc = await ref.get();
    return { id: doc.id, ...doc.data() };
  },

  async delete(id) {
    await db.collection(COLLECTION).doc(id).delete();
  },
};

module.exports = DeviceModel;
