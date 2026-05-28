const { Router } = require("express");
const ctrl = require("../controllers/command.controller");

const router = Router();

/**
 * @swagger
 * /api/command/machine/{id}/pending:
 *   get:
 *     summary: Lấy danh sách lệnh đang chờ (ESP32 poll)
 *     tags: [Command]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách lệnh pending
 */
router.get("/machine/:id/pending", ctrl.getPendingCommands);

/**
 * @swagger
 * /api/command/machine/{id}/command/{cmdId}/status:
 *   put:
 *     summary: Cập nhật trạng thái lệnh (ESP32 report)
 *     tags: [Command]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: cmdId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [processing, completed, failed]
 *               errorMessage:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put("/machine/:id/command/:cmdId/status", ctrl.updateCommandStatus);

/**
 * @swagger
 * /api/command/machine/{id}/command/{cmdId}:
 *   get:
 *     summary: Lấy chi tiết lệnh (Mobile poll)
 *     tags: [Command]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: cmdId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chi tiết lệnh
 */
router.get("/machine/:id/command/:cmdId", ctrl.getCommand);

module.exports = router;
