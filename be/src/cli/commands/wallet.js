const { ethers } = require("ethers");
const { provider, VENDING_WALLET, CHAIN_ID } = require("../../config/blockchain");
const { verifyPayment } = require("../../services/blockchain.service");
const { header, subheader, table, statusBadge, infoBlock, COLORS, bold, gray, loading, loadingDone, loadingFail } = require("../display");

function ask(rl, prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => resolve(answer.trim()));
  });
}

async function show(rl) {
  header("BLOCKCHAIN TOOLS");

  console.log("  Options:");
  console.log(`    ${COLORS.cyan("[1]")} Check any wallet balance`);
  console.log(`    ${COLORS.cyan("[2]")} Check vending machine wallet`);
  console.log(`    ${COLORS.cyan("[3]")} Verify a transaction`);
  console.log(`    ${COLORS.cyan("[4]")} Chain / network info`);
  console.log(`    ${COLORS.gray("[Enter]")} Return to main menu`);

  const choice = await ask(rl, "\n  Select option: ");

  if (choice === "1") {
    const addr = await ask(rl, "  Wallet address: ");
    if (!ethers.isAddress(addr)) {
      console.log(COLORS.red("\n  Invalid Ethereum address.\n"));
      return;
    }

    loading("Fetching balance");
    try {
      const balance = await provider.getBalance(addr);
      loadingDone("Done");
      infoBlock([
        ["Address", addr],
        ["Balance", bold(`${ethers.formatEther(balance)} ETH`)],
      ]);
    } catch (err) {
      loadingFail(`Error: ${err.message}`);
    }
  } else if (choice === "2") {
    header("Vending Machine Wallet");
    loading("Fetching balance");

    try {
      const balance = await provider.getBalance(VENDING_WALLET);
      const txCount = await provider.getTransactionCount(VENDING_WALLET);
      loadingDone("Done");

      infoBlock([
        ["Address", VENDING_WALLET],
        ["Balance", bold(`${ethers.formatEther(balance)} ETH`)],
        ["Transaction Count", String(txCount)],
      ]);

      // Recent transactions
      subheader("Recent Inbound Transactions (last 10)");
      const history = await provider.getHistory(VENDING_WALLET, 0, await provider.getBlockNumber());
      const inbound = history.filter((tx) => tx.to && tx.to.toLowerCase() === VENDING_WALLET.toLowerCase());
      const recent = inbound.slice(-10).reverse();

      if (recent.length === 0) {
        console.log(gray("  No inbound transactions found.\n"));
      } else {
        const rows = recent.map((tx) => ({
          hash: `${tx.hash.substring(0, 10)}...`,
          from: `${tx.from.substring(0, 10)}...`,
          value: `${ethers.formatEther(tx.value)} ETH`,
        }));
        table(
          [
            { key: "hash", label: "Tx Hash" },
            { key: "from", label: "From" },
            { key: "value", label: "Value" },
          ],
          rows
        );
      }
    } catch (err) {
      loadingFail(`Error: ${err.message}`);
    }
  } else if (choice === "3") {
    const txHash = await ask(rl, "  Transaction hash: ");
    console.log();

    loading("Verifying on-chain");
    const result = await verifyPayment(txHash);

    if (result.valid) {
      loadingDone("Transaction verified");
      infoBlock([
        ["Status", statusBadge("confirmed")],
        ["Hash", txHash],
        ["From", result.from],
        ["To", result.to],
        ["Amount", `${result.amountETH} ETH`],
        ["Block", `#${result.blockNumber}`],
        ["Confirmations", String(result.confirmations)],
      ]);
    } else {
      loadingFail(`Verification failed: ${result.reason}`);
      console.log();

      // Try to show raw tx info anyway
      console.log(gray("  Fetching raw transaction data..."));
      try {
        const tx = await provider.getTransaction(txHash);
        if (tx) {
          infoBlock([
            ["From", tx.from],
            ["To", tx.to || "(contract creation)"],
            ["Value", `${ethers.formatEther(tx.value)} ETH`],
            ["Chain ID", String(tx.chainId)],
            ["Nonce", String(tx.nonce)],
          ]);
        } else {
          console.log(gray("  Transaction not found on chain.\n"));
        }
      } catch {
        console.log(gray("  Could not fetch transaction.\n"));
      }
    }
  } else if (choice === "4") {
    header("Network Info");
    loading("Fetching network info");

    try {
      const blockNum = await provider.getBlockNumber();
      const feeData = await provider.getFeeData();
      const network = await provider.getNetwork();
      loadingDone("Done");

      infoBlock([
        ["Network", `${network.name} (chain ID: ${CHAIN_ID})`],
        ["RPC URL", require("../../config/env").SEPOLIA_RPC_URL],
        ["Block Number", `#${blockNum}`],
        ["Gas Price", feeData.gasPrice ? `${ethers.formatUnits(feeData.gasPrice, "gwei")} gwei` : "N/A"],
        ["Vending Wallet", VENDING_WALLET],
      ]);
    } catch (err) {
      loadingFail(`Error: ${err.message}`);
    }
  }

  console.log("  Press Enter to return to main menu.");
}

module.exports = { show };
