const { ethers } = require("ethers");
const env = require("./env");

const provider = new ethers.JsonRpcProvider(env.SEPOLIA_RPC_URL);

const VENDING_WALLET = env.VENDING_WALLET_ADDRESS;

const PRODUCT_PRICE_WEI = ethers.parseEther(
  env.PRODUCT_PRICE_ETH.toString()
);

// Minimal ABI for ERC20 transfers (if needed later)
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

module.exports = {
  provider,
  VENDING_WALLET,
  PRODUCT_PRICE_ETH: env.PRODUCT_PRICE_ETH,
  PRODUCT_PRICE_WEI,
  CHAIN_ID: env.CHAIN_ID,
  ERC20_ABI,
};
