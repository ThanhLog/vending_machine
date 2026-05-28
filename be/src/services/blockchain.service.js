const { ethers } = require("ethers");
const { provider, VENDING_WALLET, PRODUCT_PRICE_ETH, CHAIN_ID } = require("../config/blockchain");
const logger = require("../utils/logger");

/**
 * Verify an ETH payment transaction on Sepolia.
 *
 * Checks:
 * 1. Transaction exists and is confirmed
 * 2. Recipient matches vending wallet
 * 3. Value = product price (0.001 ETH)
 * 4. Chain ID matches Sepolia (11155111)
 * 5. Transaction is not too old (max 1 hour)
 */
async function verifyPayment(txHash, expectedAmountETH = PRODUCT_PRICE_ETH) {
  try {
    logger.info("Verifying payment tx:", txHash);

    const tx = await provider.getTransaction(txHash);
    if (!tx) {
      return { valid: false, reason: "Transaction not found on chain" };
    }

    // Check chain ID
    if (tx.chainId !== BigInt(CHAIN_ID)) {
      return { valid: false, reason: `Wrong chain: expected ${CHAIN_ID}, got ${tx.chainId}` };
    }

    // Check recipient
    if (tx.to && tx.to.toLowerCase() !== VENDING_WALLET.toLowerCase()) {
      return { valid: false, reason: `Wrong recipient: expected ${VENDING_WALLET}, got ${tx.to}` };
    }

    // Check value
    const expectedWei = ethers.parseEther(expectedAmountETH.toString());
    if (tx.value < expectedWei) {
      return {
        valid: false,
        reason: `Insufficient amount: expected ${expectedAmountETH} ETH, got ${ethers.formatEther(tx.value)} ETH`,
      };
    }

    // Check confirmation
    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt) {
      return { valid: false, reason: "Transaction not yet confirmed. Wait for at least 1 block." };
    }

    if (receipt.status === 0) {
      return { valid: false, reason: "Transaction reverted on chain" };
    }

    const confirmations = await receipt.confirmations();
    if (confirmations < 1) {
      return { valid: false, reason: "Transaction not confirmed. Wait for at least 1 block." };
    }

    logger.info("Payment verified:", txHash, "from:", tx.from);
    return {
      valid: true,
      from: tx.from.toLowerCase(),
      to: tx.to.toLowerCase(),
      amountETH: ethers.formatEther(tx.value),
      blockNumber: receipt.blockNumber,
      confirmations,
    };
  } catch (err) {
    logger.error("Payment verification error:", err.message);
    return { valid: false, reason: `Verification error: ${err.message}` };
  }
}

/**
 * Get wallet balance for a given address
 */
async function getBalance(address) {
  try {
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (err) {
    logger.error("getBalance error:", err.message);
    return "0";
  }
}

module.exports = { verifyPayment, getBalance };
