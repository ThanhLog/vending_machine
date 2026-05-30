require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || "development",

  // Firebase
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,

  // Blockchain
  SEPOLIA_RPC_URL:
    process.env.SEPOLIA_RPC_URL ||
    "https://ethereum-sepolia-rpc.publicnode.com",
  VENDING_WALLET_ADDRESS:
    process.env.VENDING_WALLET_ADDRESS ||
    "0x94988621cDd1aCEAa0284f65cb2EBE0B40AD7c85",
  CHAIN_ID: parseInt(process.env.CHAIN_ID || "11155111", 10),
  PRODUCT_PRICE_ETH: parseFloat(process.env.PRODUCT_PRICE_ETH || "0.001"),

  // Vending machine coordinates (Hanoi)
  VENDING_LAT: parseFloat(process.env.VENDING_LAT || "21.0288"),
  VENDING_LNG: parseFloat(process.env.VENDING_LNG || "105.8540"),
  PROXIMITY_RADIUS_M: parseInt(process.env.PROXIMITY_RADIUS_M || "50", 10),

  // Queue
  QUEUE_TIMEOUT_SEC: parseInt(process.env.QUEUE_TIMEOUT_SEC || "120", 10),
};
