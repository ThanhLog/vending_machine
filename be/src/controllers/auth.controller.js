const { ethers } = require("ethers");
const UserModel = require("../models/user.model");
const { success, error } = require("../utils/response");
const logger = require("../utils/logger");

// POST /api/auth/nonce
// Generate a nonce (random message) for the client to sign
function getNonce(req, res) {
  const nonce = `VendingMachine-Auth-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  return success(res, { nonce });
}

// POST /api/auth/login
// Verify signature and return user info
async function login(req, res) {
  try {
    const { walletAddress, signature, message } = req.body;
    if (!walletAddress || !signature || !message) {
      return error(res, "walletAddress, signature, and message are required", 400);
    }

    const recovered = ethers.verifyMessage(message, signature);
    if (recovered.toLowerCase() !== walletAddress.toLowerCase()) {
      return error(res, "Invalid signature", 401);
    }

    const user = await UserModel.findOrCreate(walletAddress);
    logger.info("User logged in:", walletAddress);
    return success(res, { user });
  } catch (err) {
    logger.error("login:", err.message);
    return error(res, err.message);
  }
}

module.exports = { getNonce, login };
