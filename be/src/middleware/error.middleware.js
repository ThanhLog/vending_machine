const logger = require("../utils/logger");
const { error } = require("../utils/response");

function errorHandler(err, req, res, _next) {
  logger.error("Unhandled error:", err.message || err);
  logger.debug("Stack:", err.stack);

  if (err.type === "entity.parse.failed") {
    return error(res, "Invalid JSON body", 400);
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    return error(res, "File too large", 413);
  }

  return error(res, err.message || "Internal Server Error", err.statusCode || 500);
}

function notFound(req, res) {
  return error(res, `Route ${req.method} ${req.originalUrl} not found`, 404);
}

module.exports = { errorHandler, notFound };
