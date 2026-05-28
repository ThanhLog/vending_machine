/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Xác thực người dùng bằng ví blockchain
 */

const { Router } = require("express");
const ctrl = require("../controllers/auth.controller");

const router = Router();

/**
 * @swagger
 * /api/auth/nonce:
 *   get:
 *     summary: Lấy nonce để ký xác thực
 *     description: Trả về một chuỗi nonce ngẫu nhiên để client ký bằng private key của ví
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Nonce được tạo thành công
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
 *                   example: OK
 *                 data:
 *                   type: object
 *                   properties:
 *                     nonce:
 *                       type: string
 *                       example: VendingMachine-Auth-1717200000000-x7k2m9p1q
 */
router.get("/nonce", ctrl.getNonce);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Đăng nhập bằng chữ ký ví
 *     description: Xác thực người dùng bằng cách xác minh chữ ký của ví Ethereum
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - walletAddress
 *               - signature
 *               - message
 *             properties:
 *               walletAddress:
 *                 type: string
 *                 description: Địa chỉ ví Ethereum
 *                 example: "0x1234567890abcdef1234567890abcdef12345678"
 *               signature:
 *                 type: string
 *                 description: Chữ ký của message được ký bằng private key
 *               message:
 *                 type: string
 *                 description: Nonce đã lấy từ endpoint /nonce
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
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
 *                   example: OK
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         walletAddress:
 *                           type: string
 *                         createdAt:
 *                           type: string
 *       401:
 *         description: Chữ ký không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Invalid signature
 *       400:
 *         description: Thiếu tham số bắt buộc
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/login", ctrl.login);

module.exports = router;
