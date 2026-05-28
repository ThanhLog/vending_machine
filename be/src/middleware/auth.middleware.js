const { ethers } = require("ethers");
const { success, error } = require("../utils/response");

// Verify that the wallet signature is valid
// The client signs a message, we recover the address
function walletAuth(req, res, next) {
  const walletAddress = req.headers["x-wallet-address"];
  const signature = req.headers["x-wallet-signature"];
  const message = req.headers["x-wallet-message"];

  // If no wallet headers, continue without auth (public endpoints)
  if (!walletAddress && !signature && !message) {
    req.walletAddress = null;
    return next();
  }

  if (!walletAddress || !signature || !message) {
    return error(res, "Missing wallet auth headers. Provide x-wallet-address, x-wallet-signature, x-wallet-message", 401);
  }

  try {
    const recovered = ethers.verifyMessage(message, signature);
    if (recovered.toLowerCase() !== walletAddress.toLowerCase()) {
      return error(res, "Invalid wallet signature", 401);
    }
    req.walletAddress = recovered.toLowerCase();
    next();
  } catch (err) {
    return error(res, "Wallet signature verification failed", 401);
  }
}

module.exports = walletAuth;
