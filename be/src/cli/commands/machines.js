const db = require("../../config/firebase");
const { header, subheader, table, statusBadge, infoBlock, COLORS, bold, loading, loadingDone } = require("../display");
const readline = require("readline");

function ask(rl, prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => resolve(answer.trim()));
  });
}

async function show(rl) {
  header("MACHINE MANAGEMENT");

  const machinesSnap = await db.collection("vending_machines").get();
  const machines = machinesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  console.log("  " + bold("All Vending Machines:\n"));

  const rows = machines.map((m) => ({
    id: m.id,
    name: m.name || m.id,
    location: m.location || "—",
    status: m.isOnline ? "online" : "offline",
    temp: m.temperature != null ? `${m.temperature}°C` : "—",
    slots: String(m.products || "—"),
    mode: m.mode || "normal",
  }));

  table(
    [
      { key: "id", label: "ID" },
      { key: "name", label: "Name" },
      { key: "location", label: "Location" },
      { key: "status", label: "Status", format: (v) => statusBadge(v) },
      { key: "temp", label: "Temp" },
      { key: "slots", label: "Slots" },
      { key: "mode", label: "Mode" },
    ],
    rows
  );

  console.log("  Options:");
  console.log(`    ${COLORS.cyan("[1]")} Toggle machine online/offline`);
  console.log(`    ${COLORS.cyan("[2]")} View machine detail`);
  console.log(`    ${COLORS.gray("[Enter]")} Return to main menu`);

  const choice = await ask(rl, "\n  Select option: ");

  if (choice === "1") {
    const mid = await ask(rl, "  Machine ID: ");
    const machine = await db.collection("vending_machines").doc(mid).get();
    if (!machine.exists) {
      console.log(COLORS.red(`\n  Machine ${mid} not found.\n`));
      return;
    }
    const data = machine.data();
    const newStatus = !data.isOnline;
    await db.collection("vending_machines").doc(mid).update({
      isOnline: newStatus,
      updatedAt: new Date().toISOString(),
    });
    console.log(
      `\n  ${COLORS.green("✔")} Machine ${bold(mid)} is now ${statusBadge(newStatus ? "online" : "offline")}\n`
    );
  } else if (choice === "2") {
    const mid = await ask(rl, "  Machine ID: ");
    const machine = await db.collection("vending_machines").doc(mid).get();
    if (!machine.exists) {
      console.log(COLORS.red(`\n  Machine ${mid} not found.\n`));
      return;
    }
    const m = { id: machine.id, ...machine.data() };

    header(`Machine Detail: ${m.id}`);
    infoBlock([
      ["Name", m.name || m.id],
      ["Location", m.location || "—"],
      ["Status", statusBadge(m.isOnline ? "online" : "offline")],
      ["Temperature", m.temperature != null ? `${m.temperature}°C` : "—"],
      ["Mode", m.mode || "normal"],
    ]);

    // Slots
    subheader("Slots");
    const slotsSnap = await db
      .collection("vending_machines")
      .doc(mid)
      .collection("slots")
      .orderBy("slot")
      .get();

    if (slotsSnap.empty) {
      console.log(COLORS.gray("  No slots configured.\n"));
    } else {
      const slotRows = slotsSnap.docs.map((d) => {
        const s = d.data();
        return {
          slot: s.slot,
          name: s.name,
          status: s.status || "available",
          price: s.price || `${s.priceETH} ETH`,
        };
      });
      table(
        [
          { key: "slot", label: "Slot" },
          { key: "name", label: "Product" },
          { key: "status", label: "Status", format: (v) => statusBadge(v) },
          { key: "price", label: "Price" },
        ],
        slotRows
      );
    }

    // Queue
    subheader("Current Queue");
    const queueSnap = await db
      .collection("vending_machines")
      .doc(mid)
      .collection("queues")
      .where("status", "in", ["waiting", "serving"])
      .orderBy("joinedAt", "asc")
      .get();

    if (queueSnap.empty) {
      console.log(COLORS.gray("  Queue is empty.\n"));
    } else {
      const queueRows = queueSnap.docs.map((d, i) => {
        const q = d.data();
        return {
          pos: q.status === "serving" ? "NOW" : String(i + 1),
          wallet: `${q.walletAddress.substring(0, 10)}...`,
          status: q.status,
          joined: new Date(q.joinedAt).toLocaleString(),
        };
      });
      table(
        [
          { key: "pos", label: "Pos" },
          { key: "wallet", label: "Wallet" },
          { key: "status", label: "Status", format: (v) => statusBadge(v) },
          { key: "joined", label: "Joined" },
        ],
        queueRows
      );
    }

    console.log("  Press Enter to return.");
  }
}

module.exports = { show };
