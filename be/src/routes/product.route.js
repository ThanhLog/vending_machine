/**
 * @swagger
 * tags:
 *   name: Product
 *   description: Mua hàng và xem sản phẩm theo máy
 */

const router = require("express").Router();
const vendingService = require("../services/vending.service");
const { success, error } = require("../utils/response");
const logger = require("../utils/logger");

/**
 * @swagger
 * /api/product/purchase:
 *   post:
 *     summary: Xử lý giao dịch mua hàng
 *     description: Xác nhận giao dịch blockchain và tạo đơn hàng sau khi thanh toán thành công
 *     tags: [Product]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - machineId
 *               - slot
 *               - txHash
 *               - walletAddress
 *             properties:
 *               machineId:
 *                 type: string
 *                 description: Mã định danh máy
 *               slot:
 *                 type: string
 *                 description: Số thứ tự khe hàng đã chọn
 *               productName:
 *                 type: string
 *                 description: Tên sản phẩm (tùy chọn)
 *               txHash:
 *                 type: string
 *                 description: Transaction hash trên blockchain
 *               walletAddress:
 *                 type: string
 *                 description: Địa chỉ ví người mua
 *     responses:
 *       201:
 *         description: Mua hàng thành công
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
 *                   example: Purchase successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     machineId:
 *                       type: string
 *                     slot:
 *                       type: string
 *                     productName:
 *                       type: string
 *                     txHash:
 *                       type: string
 *                     walletAddress:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *       400:
 *         description: Thiếu tham số bắt buộc hoặc lỗi xử lý
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/purchase", async (req, res) => {
  try {
    const { machineId, slot, productName, txHash, walletAddress } = req.body;

    if (!machineId || !slot || !txHash || !walletAddress) {
      return error(res, "machineId, slot, txHash, and walletAddress are required", 400);
    }

    const order = await vendingService.processPurchase({
      machineId,
      slot,
      productName: productName || "",
      txHash,
      walletAddress,
    });

    const notificationService = require("../services/notification.service");
    notificationService.notifyPurchaseComplete(machineId, slot, productName);

    return success(res, order, "Purchase successful", 201);
  } catch (err) {
    logger.error("purchase:", err.message);
    return error(res, err.message, 400);
  }
});

/**
 * @swagger
 * /api/product/machine/{machineId}:
 *   get:
 *     summary: Lấy danh sách sản phẩm của máy
 *     description: Trả về tất cả sản phẩm (khe hàng) của một máy bán hàng
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: machineId
 *         required: true
 *         schema:
 *           type: string
 *         description: Mã định danh máy
 *     responses:
 *       200:
 *         description: Danh sách sản phẩm
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
 *                     $ref: '#/components/schemas/Slot'
 */
router.get("/machine/:machineId", async (req, res) => {
  try {
    const firebaseService = require("../services/firebase.service");
    const slots = await firebaseService.getSlots(req.params.machineId);
    return success(res, slots);
  } catch (err) {
    logger.error("getProducts:", err.message);
    return error(res, err.message);
  }
});

module.exports = router;
