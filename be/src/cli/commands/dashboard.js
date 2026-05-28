const db = require("../../config/firebase");
const { provider } = require("../../config/blockchain");
const { header, subheader, table, statusBadge, infoBlock, COLORS, bold, dim, loading, loadingDone, loadingFail } = require("../display");

async function show() {
  header("VENDING MACHINE — SYSTEM DASHBOARD");

  // Machine overview
  loading("Fetching machines");
  const machinesSnap = await db.collection("vending_machines").get();
  const machines = machinesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  loadingDone(`Loaded ${machines.length} machines`);

  const online = machines.filter((m) => m.isOnline).length;
  const offline = machines.length - online;

  console.log("  " + bold("Machines:"));
  console.log(`    ${COLORS.green(`Online:  ${online}`)}`);
  console.log(`    ${COLORS.red(`Offline: ${offline}`)}`);
  console.log(`    Total:   ${machines.length}`);
  console.log();

  // Queue sizes per machine
  subheader("Queue Status");
  const queueRows = [];
  for (const m of machines) {
    const queueSnap = await db
      .collection("vending_machines")
      .doc(m.id)
      .collection("queues")
      .where("status", "in", ["waiting", "serving"])
      .get();
    queueRows.push({
      id: m.id,
      name: m.name,
      status: m.isOnline ? "online" : "offline",
      inQueue: String(queueSnap.size),
      location: m.location || "—",
    });
  }

  table(
    [
      { key: "id", label: "ID" },
      { key: "name", label: "Name" },
      { key: "location", label: "Location" },
      { key: "status", label: "Status", format: (v) => statusBadge(v) },
      { key: "inQueue", label: "Queue" },
    ],
    queueRows
  );

  // Recent orders
  subheader("Recent Orders (last 5)");
  loading("Fetching orders");
  const ordersSnap = await db
    .collection("orders")
    .orderBy("createdAt", "desc")
    .limit(5)
    .get();
  loadingDone(`Loaded ${ordersSnap.size} orders`);

  if (ordersSnap.empty) {
    console.log(COLORS.gray("  No orders yet.\n"));
  } else {
    const orderRows = ordersSnap.docs.map((d) => {
      const o = d.data();
      return {
        id: d.id.substring(0, 8),
        machine: o.machineId,
        product: o.productName,
        slot: o.slot,
        status: o.status,
        price: `${o.priceETH} ETH`,
        wallet: `${o.walletAddress.substring(0, 8)}...`,
        time: new Date(o.createdAt).toLocaleString(),
      };
    });
    table(
      [
        { key: "id", label: "Order ID" },
        { key: "time", label: "Time" },
        { key: "machine", label: "Machine" },
        { key: "product", label: "Product" },
        { key: "price", label: "Price" },
        { key: "status", label: "Status", format: (v) => statusBadge(v) },
      ],
      orderRows
    );
  }

  // RPC health
  subheader("Network Health");
  loading("Checking Sepolia RPC");
  try {
    const blockNum = await provider.getBlockNumber();
    loadingDone(`Sepolia RPC OK — block #${blockNum}`);
  } catch {
    loadingFail("Sepolia RPC unreachable");
  }

  // Vending wallet
  const { VENDING_WALLET } = require("../../config/blockchain");
  try {
    const balance = await provider.getBalance(VENDING_WALLET);
    const { ethers } = require("ethers");
    console.log(`  Vending wallet: ${COLORS.gray(VENDING_WALLET)}`);
    console.log(`  Balance:        ${bold(ethers.formatEther(balance))} ETH\n`);
  } catch {
    console.log(`  Vending wallet: ${COLORS.gray(VENDING_WALLET)} (balance unavailable)\n`);
  }

  console.log("  Press Enter to return to main menu.");
}

module.exports = { show };
