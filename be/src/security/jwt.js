// Wallet-based auth uses signature verification instead of JWT.
// Kept as placeholder for future admin auth.
const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "vending-machine-secret-dev";

function sign(payload, expiresIn = "24h") {
  return jwt.sign(payload, SECRET, { expiresIn });
}

function verify(token) {
  return jwt.verify(token, SECRET);
}

module.exports = { sign, verify };
