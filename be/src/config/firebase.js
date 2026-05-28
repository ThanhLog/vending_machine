const admin = require("firebase-admin");
const env = require("./env");

let db = null;

if (env.FIREBASE_PROJECT_ID && env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY.split(String.fromCharCode(92) + "n").join("\n"),
    }),
  });
  db = admin.firestore();
  console.log("[firebase] Initialized successfully");
} else {
  console.warn("[firebase] Credentials not configured. Set FIREBASE_* in .env");
  console.warn("[firebase] Server will start but database operations will fail.");
}

module.exports = db;
