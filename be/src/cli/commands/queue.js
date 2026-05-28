const db = require("../../config/firebase");
const { header, subheader, table, statusBadge, COLORS, bold, gray, loading, loadingDone } = require("../display");

function ask(rl, prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => resolve(answer.trim()));
  });
}

async function show(rl) {
  header("QUEUE MANAGEMENT");

  // Pick machine
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
  const queueRef = db.collection("vending_machines").doc(machine.id).collection("queues");

  header(`Queue: ${machine.id} — ${machine.name || machine.id}`);

  // Active queue entries
  const activeSnap = await queueRef
    .where("status", "in", ["waiting", "serving"])
    .orderBy("status", "desc")
    .orderBy("joinedAt", "asc")
    .get();

  if (activeSnap.empty) {
    console.log(gray("  Queue is currently empty.\n"));
  } else {
    const rows = activeSnap.docs.map((d) => {
      const q = d.data();
      return {
        id: d.id.substring(0, 8),
        status: q.status,
        wallet: `${q.walletAddress.substring(0, 12)}...`,
        joined: new Date(q.joinedAt).toLocaleString(),
        serving: q.servingAt ? new Date(q.servingAt).toLocaleString() : "—",
        expires: q.expiresAt ? new Date(q.expiresAt).toLocaleString() : "—",
      };
    });
    table(
      [
        { key: "id", label: "Entry ID" },
        { key: "status", label: "Status", format: (v) => statusBadge(v) },
        { key: "wallet", label: "Wallet" },
        { key: "joined", label: "Joined" },
        { key: "serving", label: "Serving At" },
        { key: "expires", label: "Expires At" },
      ],
      rows
    );
  }

  // History (completed/expired)
  const historySnap = await queueRef
    .where("status", "in", ["completed", "expired", "cancelled"])
    .orderBy("joinedAt", "desc")
    .limit(10)
    .get();

  if (!historySnap.empty) {
    subheader("Recent History (last 10)");
    const histRows = historySnap.docs.map((d) => {
      const q = d.data();
      return {
        id: d.id.substring(0, 8),
        status: q.status,
        wallet: `${q.walletAddress.substring(0, 12)}...`,
        completed: q.completedAt ? new Date(q.completedAt).toLocaleString() : "—",
      };
    });
    table(
      [
        { key: "id", label: "Entry ID" },
        { key: "status", label: "Status", format: (v) => statusBadge(v) },
        { key: "wallet", label: "Wallet" },
        { key: "completed", label: "Completed" },
      ],
      histRows
    );
  }

  console.log("  Options:");
  console.log(`    ${COLORS.cyan("[1]")} Expire a queue entry`);
  console.log(`    ${COLORS.cyan("[2]")} Clear entire queue (mark all as expired)`);
  console.log(`    ${COLORS.gray("[Enter]")} Return to main menu`);

  const action = await ask(rl, "\n  Select option: ");

  if (action === "1") {
    const entryId = await ask(rl, "  Queue entry ID (or full ID): ");

    try {
      const docRef = queueRef.doc(entryId);
      const doc = await docRef.get();
      if (!doc.exists) {
        console.log(COLORS.red(`\n  Entry ${entryId} not found.\n`));
        return;
      }
      await docRef.update({
        status: "expired",
        completedAt: new Date().toISOString(),
      });
      console.log(`\n  ${COLORS.green("✔")} Entry ${bold(entryId.substring(0, 8))} expired.\n`);
    } catch {
      console.log(COLORS.red(`\n  Entry ${entryId} not found.\n`));
    }
  } else if (action === "2") {
    const confirm = await ask(
      rl,
      `  ${COLORS.yellow("WARNING:")} This will expire ALL active queue entries. Type "yes" to confirm: `
    );
    if (confirm.toLowerCase() !== "yes") {
      console.log(gray("\n  Cancelled.\n"));
      return;
    }

    const allActive = await queueRef.where("status", "in", ["waiting", "serving"]).get();
    const batch = db.batch();
    allActive.docs.forEach((d) => {
      batch.update(d.ref, {
        status: "expired",
        completedAt: new Date().toISOString(),
      });
    });
    await batch.commit();

    console.log(`\n  ${COLORS.green("✔")} Cleared ${allActive.size} queue entries.\n`);
  }

  console.log("  Press Enter to return.");
}

module.exports = { show };
