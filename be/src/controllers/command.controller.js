const commandService = require("../services/command.service");
const { success, error } = require("../utils/response");
const logger = require("../utils/logger");

// GET /api/command/machine/:id/pending
async function getPendingCommands(req, res) {
  try {
    const commands = await commandService.getPendingCommands(req.params.id);
    return success(res, commands);
  } catch (err) {
    logger.error("getPendingCommands:", err.message);
    return error(res, err.message);
  }
}

// PUT /api/command/machine/:id/command/:cmdId/status
async function updateCommandStatus(req, res) {
  try {
    const { status, errorMessage } = req.body;

    if (!status || !["processing", "completed", "failed"].includes(status)) {
      return error(res, "status must be one of: processing, completed, failed", 400);
    }

    const updated = await commandService.updateCommandStatus(
      req.params.id,
      req.params.cmdId,
      status,
      errorMessage || null
    );

    return success(res, updated);
  } catch (err) {
    logger.error("updateCommandStatus:", err.message);
    return error(res, err.message);
  }
}

// GET /api/command/machine/:id/command/:cmdId
async function getCommand(req, res) {
  try {
    const command = await commandService.getCommand(req.params.id, req.params.cmdId);
    if (!command) return error(res, "Command not found", 404);
    return success(res, command);
  } catch (err) {
    logger.error("getCommand:", err.message);
    return error(res, err.message);
  }
}

module.exports = { getPendingCommands, updateCommandStatus, getCommand };
