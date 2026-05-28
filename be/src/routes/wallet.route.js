/**
 * @swagger
 * tags:
 *   name: Wallet
 *   description: Quản lý ví — số dư và lịch sử giao dịch
 */

const { Router } = require("express");
const ctrl = require("../controllers/wallet.controller");

const router = Router();

/**
 * @swagger
 * /api/wallet/{address}/balance:
 *   get:
 *     summary: Lấy số dư ví
 *     description: Trả về số dư ETH của địa chỉ ví
 *     tags: [Wallet]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Địa chỉ ví Ethereum
 *     responses:
 *       200:
 *         description: Số dư ví
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     balance:
 *                       type: string
 *                       description: Số dư ETH
 *                       example: "1.5"
 */
router.get("/:address/balance", ctrl.getBalance);

/**
 * @swagger
 * /api/wallet/{address}/history:
 *   get:
 *     summary: Lấy lịch sử giao dịch
 *     description: Trả về danh sách lịch sử mua hàng của địa chỉ ví
 *     tags: [Wallet]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Địa chỉ ví Ethereum
 *     responses:
 *       200:
 *         description: Lịch sử giao dịch
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       machineId:
 *                         type: string
 *                       slot:
 *                         type: string
 *                       productName:
 *                         type: string
 *                       txHash:
 *                         type: string
 *                       walletAddress:
 *                         type: string
 *                       amount:
 *                         type: string
 *                       createdAt:
 *                         type: string
 */
router.get("/:address/history", ctrl.getHistory);

module.exports = router;
