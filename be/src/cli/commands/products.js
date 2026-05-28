const db = require("../../config/firebase");
const { header, subheader, table, statusBadge, COLORS, bold } = require("../display");

function ask(rl, prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => resolve(answer.trim()));
  });
}

const VALID_STATUSES = ["available", "sold", "empty", "locked", "error"];

async function show(rl) {
  header("PRODUCT / SLOT MANAGEMENT");

  // Pick machine first
  const machinesSnap = await db.collection("vending_machines").get();
  const machines = machinesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  console.log("  " + bold("Select a machine:\n"));
  machines.forEach((m, i) => {
    const status = m.isOnline ? COLORS.green("ONLINE") : COLORS.red("OFFLINE");
    console.log(`    ${COLORS.cyan(`[${i + 1}]`)} ${m.id} — ${m.name || m.id} (${status})`);
  });
  console.log(`    ${COLORS.gray("[Enter]")} Return to main menu`);

  const choice = await ask(rl, "\n  Select: ");
  if (!choice) return;

  const idx = parseInt(choice, 10) - 1;
  if (isNaN(idx) || idx < 0 || idx >= machines.length) {
    console.log(COLORS.red("\n  Invalid selection.\n"));
    return;
  }

  const machine = machines[idx];
  header(`Slots for ${machine.id} — ${machine.name || machine.id}`);

  const slotsSnap = await db
    .collection("vending_machines")
    .doc(machine.id)
    .collection("slots")
    .orderBy("slot")
    .get();

  if (slotsSnap.empty) {
    console.log(COLORS.gray("  No slots configured for this machine.\n"));
    console.log("  Press Enter to return.");
    return;
  }

  const slots = slotsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  const rows = slots.map((s) => ({
    slot: s.slot,
    name: s.name || "—",
    status: s.status || "available",
    price: s.price || `${s.priceETH} ETH`,
  }));

  table(
    [
      { key: "slot", label: "Slot" },
      { key: "name", label: "Product" },
      { key: "status", label: "Status", format: (v) => statusBadge(v) },
      { key: "price", label: "Price" },
    ],
    rows
  );

  console.log("  Options:");
  console.log(`    ${COLORS.cyan("[1]")} Update slot status`);
  console.log(`    ${COLORS.cyan("[2]")} Update product name and price`);
  console.log(`    ${COLORS.gray("[Enter]")} Return`);

  const action = await ask(rl, "\n  Select option: ");

  if (action === "1") {
    const slotId = await ask(rl, "  Slot (e.g. A1): ");
    const slot = slots.find((s) => s.slot === slotId);
    if (!slot) {
      console.log(COLORS.red(`\n  Slot ${slotId} not found.\n`));
      return;
    }

    console.log(`\n  Current status: ${statusBadge(slot.status)}`);
    console.log(`  Valid statuses: ${VALID_STATUSES.map((s) => statusBadge(s)).join(", ")}`);
    const newStatus = await ask(rl, "  New status: ");
    if (!VALID_STATUSES.includes(newStatus)) {
      console.log(COLORS.red(`\n  Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}\n`));
      return;
    }

    await db
      .collection("vending_machines")
      .doc(machine.id)
      .collection("slots")
      .doc(slotId)
      .update({ status: newStatus, updatedAt: new Date().toISOString() });

    console.log(`\n  ${COLORS.green("✔")} Slot ${bold(slotId)} updated to ${statusBadge(newStatus)}\n`);
  } else if (action === "2") {
    const slotId = await ask(rl, "  Slot (e.g. A1): ");
    const slot = slots.find((s) => s.slot === slotId);
    if (!slot) {
      console.log(COLORS.red(`\n  Slot ${slotId} not found.\n`));
      return;
    }

    console.log(`\n  Current: ${slot.name} — ${slot.price || `${slot.priceETH} ETH`}`);
    const newName = await ask(rl, "  New product name (Enter to keep): ");
    const newPrice = await ask(rl, "  New USD price (Enter to keep): ");
    const newPriceETH = await ask(rl, "  New ETH price (Enter to keep): ");

    const update = { updatedAt: new Date().toISOString() };
    if (newName) update.name = newName;
    if (newPrice) update.price = newPrice;
    if (newPriceETH) update.priceETH = parseFloat(newPriceETH);

    await db
      .collection("vending_machines")
      .doc(machine.id)
      .collection("slots")
      .doc(slotId)
      .set(update, { merge: true });

    console.log(`\n  ${COLORS.green("✔")} Slot ${bold(slotId)} updated.\n`);
  }

  console.log("  Press Enter to return.");
}

module.exports = { show };
