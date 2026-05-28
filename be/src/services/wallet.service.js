const blockchainService = require("./blockchain.service");

/**
 * Wallet service - fetches balance and validates wallet info.
 * Private key operations happen client-side (mobile app).
 * Server only verifies transactions and checks balances.
 */
async function getBalance(address) {
  return blockchainService.getBalance(address);
}

module.exports = { getBalance };
