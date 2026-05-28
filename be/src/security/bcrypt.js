// Wallet-based auth doesn't use bcrypt.
// Kept as placeholder for future admin password auth.
const bcrypt = require("bcryptjs");

const SALT_ROUNDS = 10;

async function hash(text) {
  return bcrypt.hash(text, SALT_ROUNDS);
}

async function compare(text, hashed) {
  return bcrypt.compare(text, hashed);
}

module.exports = { hash, compare };
