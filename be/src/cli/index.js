const readline = require("readline");
const { clear, header, COLORS, bold, gray } = require("./display");

const COMMANDS = {
  "1": { name: "Dashboard", module: "./commands/dashboard" },
  "2": { name: "Machine Management", module: "./commands/machines" },
  "3": { name: "Product / Slot Management", module: "./commands/products" },
  "4": { name: "Payment / Order Management", module: "./commands/payments" },
  "5": { name: "Queue Management", module: "./commands/queue" },
  "6": { name: "Blockchain Tools", module: "./commands/wallet" },
};

function createRL() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

function showMenu() {
  clear();
  header("VENDING MACHINE — PAYMENT MANAGEMENT CLI");
  console.log("  " + bold("Main Menu:\n"));
  for (const [key, cmd] of Object.entries(COMMANDS)) {
    console.log(`    ${COLORS.cyan(`[${key}]`)} ${cmd.name}`);
  }
  console.log(`    ${COLORS.gray("[q]")} Quit\n`);
}

async function main() {
  const rl = createRL();

  const ask = (prompt) =>
    new Promise((resolve) => {
      rl.question(prompt, (answer) => resolve(answer.trim()));
    });

  // Graceful exit
  process.on("SIGINT", () => {
    console.log(`\n${gray("  Goodbye!")}\n`);
    rl.close();
    process.exit(0);
  });

  // Check DB
  const db = require("../config/firebase");
  if (!db) {
    console.log(COLORS.red("Firebase is not configured. Check your .env file.\n"));
    rl.close();
    process.exit(1);
  }

  while (true) {
    showMenu();
    const choice = await ask("  Select: ");

    if (choice === "q" || choice === "Q") {
      console.log(`\n${gray("  Goodbye!")}\n`);
      rl.close();
      process.exit(0);
    }

    const cmd = COMMANDS[choice];
    if (!cmd) {
      console.log(`\n  ${COLORS.red("Invalid choice.")} Press Enter to continue...`);
      await ask("");
      continue;
    }

    try {
      clear();
      const mod = require(cmd.module);
      await mod.show(rl);
      console.log();
      await ask("  Press Enter to continue...");
    } catch (err) {
      console.log(`\n  ${COLORS.red("Error:")} ${err.message}`);
      console.log(gray(`  ${err.stack?.split("\n")[1] || ""}`));
      console.log();
      await ask("  Press Enter to continue...");
    }
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
