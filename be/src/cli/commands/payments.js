const db = require("../../config/firebase");
const { verifyPayment } = require("../../services/blockchain.service");
const { header, subheader, table, statusBadge, infoBlock, COLORS, bold, gray, loading, loadingDone, divider } = require("../display");

function ask(rl, prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => resolve(answer.trim()));
  });
}

async function show(rl) {
  header("PAYMENT / ORDER MANAGEMENT");

  console.log("  Options:");
  console.log(`    ${COLORS.cyan("[1]")} View recent orders (all)`);
  console.log(`    ${COLORS.cyan("[2]")} View orders by machine`);
  console.log(`    ${COLORS.cyan("[3]")} View orders by wallet`);
  console.log(`    ${COLORS.cyan("[4]")} Verify a transaction on-chain`);
  console.log(`    ${COLORS.cyan("[5]")} Order statistics`);
  console.log(`    ${COLORS.gray("[Enter]")} Return to main menu`);

  const choice = await ask(rl, "\n  Select option: ");

  if (choice === "1" || choice === "2" || choice === "3") {
    let query = db.collection("orders").orderBy("createdAt", "desc").limit(50);

    if (choice === "2") {
      const mid = await ask(rl, "  Machine ID: ");
      query = query.where("machineId", "==", mid);
      header(`Orders for Machine: ${mid}`);
    } else if (choice === "3") {
      const addr = await ask(rl, "  Wallet address: ");
      query = query.where("walletAddress", "==", addr.toLowerCase());
      header(`Orders for Wallet: ${addr}`);
    } else {
      header("Recent Orders (last 50)");
    }

    loading("Fetching orders");
    const snap = await query.get();
    loadingDone(`Found ${snap.size} orders`);

    if (snap.empty) {
      console.log(gray("  No orders found.\n"));
    } else {
      const rows = snap.docs.map((d) => {
        const o = d.data();
        return {
          id: d.id.substring(0, 8),
          time: new Date(o.createdAt).toLocaleString(),
          machine: o.machineId,
          slot: o.slot,
          product: o.productName,
          price: `${o.priceETH} ETH`,
          status: o.status,
          wallet: `${o.walletAddress.substring(0, 8)}...`,
        };
      });
      table(
        [
          { key: "id", label: "ID" },
          { key: "time", label: "Time" },
          { key: "machine", label: "Machine" },
          { key: "product", label: "Product" },
          { key: "price", label: "Price" },
          { key: "status", label: "Status", format: (v) => statusBadge(v) },
        ],
        rows
      );
    }
  } else if (choice === "4") {
    const txHash = await ask(rl, "  Transaction hash: ");
    console.log();
    loading("Verifying on-chain");
    const result = await verifyPayment(txHash);
    if (result.valid) {
      loadingDone("Transaction verified");
      infoBlock([
        ["Status", statusBadge("confirmed")],
        ["From", result.from],
        ["To", result.to],
        ["Amount", `${result.amountETH} ETH`],
        ["Block", `#${result.blockNumber}`],
        ["Confirmations", String(result.confirmations)],
      ]);
    } else {
      loadingFail(`Verification failed: ${result.reason}`);
      console.log();
    }
  } else if (choice === "5") {
    header("Order Statistics");
    loading("Computing stats");

    const allSnap = await db.collection("orders").get();
    const orders = allSnap.docs.map((d) => d.data());
    loadingDone(`${orders.length} total orders`);

    const totalRevenue = orders.reduce((sum, o) => sum + (o.priceETH || 0), 0);
    const confirmed = orders.filter((o) => o.status === "confirmed").length;
    const dispensed = orders.filter((o) => o.status === "dispensed" || o.status === "completed").length;
    const failed = orders.filter((o) => o.status === "failed").length;

    // Per machine
    const machineStats = {};
    for (const o of orders) {
      if (!machineStats[o.machineId]) {
        machineStats[o.machineId] = { count: 0, revenue: 0 };
      }
      machineStats[o.machineId].count++;
      machineStats[o.machineId].revenue += o.priceETH || 0;
    }

    infoBlock([
      ["Total Orders", bold(String(orders.length))],
      ["Confirmed", COLORS.green(String(confirmed))],
      ["Dispensed", COLORS.blue(String(dispensed))],
      ["Failed", COLORS.red(String(failed))],
      ["Total Revenue", bold(`${totalRevenue.toFixed(4)} ETH`)],
    ]);

    subheader("Per Machine");
    const machineRows = Object.entries(machineStats).map(([id, stats]) => ({
      machine: id,
      orders: String(stats.count),
      revenue: `${stats.revenue.toFixed(4)} ETH`,
    }));
    table(
      [
        { key: "machine", label: "Machine" },
        { key: "orders", label: "Orders" },
        { key: "revenue", label: "Revenue" },
      ],
      machineRows
    );
  }

  console.log("  Press Enter to return to main menu.");
}

module.exports = { show };
