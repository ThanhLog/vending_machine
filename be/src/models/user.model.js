const db = require("../config/firebase");

const USERS_COLLECTION = "users";

const UserModel = {
  async findOrCreate(walletAddress) {
    const ref = db.collection(USERS_COLLECTION).doc(walletAddress.toLowerCase());
    const doc = await ref.get();

    if (!doc.exists) {
      const user = {
        walletAddress: walletAddress.toLowerCase(),
        createdAt: new Date().toISOString(),
        totalPurchases: 0,
        totalSpentETH: 0,
      };
      await ref.set(user);
      return user;
    }
    return doc.data();
  },

  async getByAddress(walletAddress) {
    const ref = db.collection(USERS_COLLECTION).doc(walletAddress.toLowerCase());
    const doc = await ref.get();
    return doc.exists ? doc.data() : null;
  },

  async addPurchase(walletAddress, amountETH) {
    const ref = db.collection(USERS_COLLECTION).doc(walletAddress.toLowerCase());
    await db.runTransaction(async (tx) => {
      const doc = await tx.get(ref);
      const data = doc.exists ? doc.data() : { totalPurchases: 0, totalSpentETH: 0 };
      tx.set(ref, {
        ...data,
        walletAddress: walletAddress.toLowerCase(),
        totalPurchases: (data.totalPurchases || 0) + 1,
        totalSpentETH: (data.totalSpentETH || 0) + amountETH,
        lastPurchaseAt: new Date().toISOString(),
      }, { merge: true });
    });
  },
};

module.exports = UserModel;
