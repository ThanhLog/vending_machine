// ANSI escape codes for terminal styling
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";

const COLORS = {
  red: (s) => `\x1b[31m${s}${RESET}`,
  green: (s) => `\x1b[32m${s}${RESET}`,
  yellow: (s) => `\x1b[33m${s}${RESET}`,
  blue: (s) => `\x1b[34m${s}${RESET}`,
  magenta: (s) => `\x1b[35m${s}${RESET}`,
  cyan: (s) => `\x1b[36m${s}${RESET}`,
  white: (s) => `\x1b[37m${s}${RESET}`,
  gray: (s) => `\x1b[90m${s}${RESET}`,
};

function bold(s) {
  return `${BOLD}${s}${RESET}`;
}

function dim(s) {
  return `${DIM}${s}${RESET}`;
}

// Print a section header
function header(title) {
  const line = "═".repeat(60);
  console.log(`\n${COLORS.cyan(bold(line))}`);
  console.log(COLORS.cyan(bold(`  ${title}`)));
  console.log(`${COLORS.cyan(bold(line))}\n`);
}

// Print a sub-header
function subheader(title) {
  const line = "─".repeat(40);
  console.log(`\n${COLORS.blue(bold(`  ${title}`))}`);
  console.log(`${COLORS.gray(line)}`);
}

// Render an array of objects as an aligned table
function table(columns, rows) {
  if (!rows || rows.length === 0) {
    console.log(COLORS.gray("  (no data)\n"));
    return;
  }

  // Calculate column widths
  const widths = {};
  for (const col of columns) {
    widths[col.key] = col.label.length;
    for (const row of rows) {
      const val = String(row[col.key] ?? "");
      if (val.length > widths[col.key]) widths[col.key] = val.length;
    }
    // Minimum padding
    widths[col.key] = Math.max(widths[col.key], 4);
  }

  // Header row
  const headerParts = columns.map((col) => col.label.padEnd(widths[col.key]));
  console.log("  " + COLORS.cyan(bold(headerParts.join("  "))));

  // Separator
  const sepParts = columns.map((col) => "─".repeat(widths[col.key]));
  console.log("  " + COLORS.gray(sepParts.join("  ")));

  // Data rows
  for (const row of rows) {
    const parts = columns.map((col) => {
      let val = String(row[col.key] ?? "");
      if (col.format) val = col.format(val, row);
      return val.padEnd(widths[col.key]);
    });
    console.log("  " + parts.join("  "));
  }
  console.log();
}

// Status badge with color
function statusBadge(status) {
  const s = String(status).toLowerCase();
  if (s === "online" || s === "available" || s === "confirmed" || s === "completed" || s === "ready") {
    return COLORS.green(bold(s.toUpperCase()));
  }
  if (s === "offline" || s === "sold" || s === "expired" || s === "error" || s === "locked") {
    return COLORS.red(bold(s.toUpperCase()));
  }
  if (s === "waiting" || s === "serving" || s === "empty") {
    return COLORS.yellow(bold(s.toUpperCase()));
  }
  if (s === "dispensed") {
    return COLORS.blue(bold(s.toUpperCase()));
  }
  return bold(s.toUpperCase());
}

// Print a key-value info block
function infoBlock(pairs) {
  const maxKeyLen = Math.max(...pairs.map(([k]) => k.length));
  for (const [key, value] of pairs) {
    const paddedKey = key.padEnd(maxKeyLen + 2);
    console.log(`  ${COLORS.gray(paddedKey)} ${value}`);
  }
  console.log();
}

// Clear screen
function clear() {
  process.stdout.write("\x1b[2J\x1b[H");
}

// Divider line
function divider() {
  console.log(COLORS.gray("─".repeat(60)));
}

// Loading message
function loading(msg) {
  process.stdout.write(`  ${COLORS.yellow("⏳")} ${msg}...`);
}

function loadingDone(msg) {
  process.stdout.write(`\r  ${COLORS.green("✔")} ${msg}   \n`);
}

function loadingFail(msg) {
  process.stdout.write(`\r  ${COLORS.red("✖")} ${msg}   \n`);
}

module.exports = {
  RESET,
  COLORS,
  bold,
  dim,
  header,
  subheader,
  table,
  statusBadge,
  infoBlock,
  clear,
  divider,
  loading,
  loadingDone,
  loadingFail,
};
