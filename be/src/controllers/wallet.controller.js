const walletService = require("../services/wallet.service");
const vendingService = require("../services/vending.service");
const { success, error } = require("../utils/response");
const logger = require("../utils/logger");

// GET /api/wallet/:address/balance
async function getBalance(req, res) {
  try {
    const balance = await walletService.getBalance(req.params.address);
    return success(res, { balance });
  } catch (err) {
    logger.error("getBalance:", err.message);
    return error(res, err.message);
  }
}

// GET /api/wallet/:address/history
async function getHistory(req, res) {
  try {
    const history = await vendingService.getPurchaseHistory(req.params.address);
    return success(res, history);
  } catch (err) {
    logger.error("getHistory:", err.message);
    return error(res, err.message);
  }
}

module.exports = { getBalance, getHistory };
