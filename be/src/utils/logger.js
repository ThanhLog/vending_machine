const env = require("../config/env");

const levels = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };

const currentLevel = env.NODE_ENV === "production" ? levels.INFO : levels.DEBUG;

function timestamp() {
  return new Date().toISOString();
}

const logger = {
  debug: (...args) => {
    if (currentLevel <= levels.DEBUG) console.log(`[${timestamp()}] DEBUG:`, ...args);
  },
  info: (...args) => {
    if (currentLevel <= levels.INFO) console.log(`[${timestamp()}] INFO:`, ...args);
  },
  warn: (...args) => {
    if (currentLevel <= levels.WARN) console.warn(`[${timestamp()}] WARN:`, ...args);
  },
  error: (...args) => {
    if (currentLevel <= levels.ERROR) console.error(`[${timestamp()}] ERROR:`, ...args);
  },
};

module.exports = logger;
