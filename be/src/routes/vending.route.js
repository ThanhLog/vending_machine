const { Router } = require("express");
const ctrl = require("../controllers/vending.controller");

const router = Router();

/**
 * @swagger
 * /api/vending:
 *   get:
 *     summary: Lấy danh sách máy bán hàng
 *     description: Trả về danh sách tất cả máy bán hàng. Có thể lọc theo vị trí nếu cung cấp lat/lng.
 *     tags: [Vending]
 *     parameters:
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *         description: Vĩ độ để lọc theo vị trí
 *       - in: query
 *         name: lng
 *         schema:
 *           type: number
 *         description: Kinh độ để lọc theo vị trí
 *     responses:
 *       200:
 *         description: Danh sách máy bán hàng
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
 *                     $ref: '#/components/schemas/Machine'
 */
router.get("/", ctrl.listMachines);

/**
 * @swagger
 * /api/vending/{id}:
 *   get:
 *     summary: Lấy chi tiết máy bán hàng
 *     description: Trả về thông tin chi tiết của một máy, bao gồm danh sách khe hàng
 *     tags: [Vending]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Mã định danh máy
 *     responses:
 *       200:
 *         description: Chi tiết máy bán hàng
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
 *                   $ref: '#/components/schemas/MachineDetail'
 *       404:
 *         description: Không tìm thấy máy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:id", ctrl.getMachine);

/**
 * @swagger
 * /api/vending/{id}/connect:
 *   post:
 *     summary: Tham gia hàng đợi của máy
 *     description: Người dùng tham gia hàng đợi để mua hàng tại máy
 *     tags: [Vending]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Mã định danh máy
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - walletAddress
 *             properties:
 *               walletAddress:
 *                 type: string
 *                 description: Địa chỉ ví người dùng
 *     responses:
 *       201:
 *         description: Đã tham gia hàng đợi thành công
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
 *                   example: Joined queue successfully
 *                 data:
 *                   $ref: '#/components/schemas/QueueEntry'
 *       400:
 *         description: Thiếu walletAddress
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/:id/connect", ctrl.connectMachine);

/**
 * @swagger
 * /api/vending/{id}/queue/status:
 *   get:
 *     summary: Kiểm tra vị trí trong hàng đợi
 *     description: Kiểm tra trạng thái và vị trí hiện tại của người dùng trong hàng đợi
 *     tags: [Vending]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Mã định danh máy
 *       - in: query
 *         name: walletAddress
 *         required: true
 *         schema:
 *           type: string
 *         description: Địa chỉ ví người dùng
 *     responses:
 *       200:
 *         description: Trạng thái hàng đợi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     position:
 *                       type: integer
 *                     totalInQueue:
 *                       type: integer
 *                     currentServing:
 *                       type: string
 *       404:
 *         description: Người dùng không có trong hàng đợi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Thiếu walletAddress
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:id/queue/status", ctrl.queueStatus);

/**
 * @swagger
 * /api/vending/{id}/serve-next:
 *   post:
 *     summary: Phục vụ người tiếp theo trong hàng đợi
 *     description: Gọi người tiếp theo trong hàng đợi lên phục vụ (gọi từ máy hoặc admin)
 *     tags: [Vending]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Mã định danh máy
 *     responses:
 *       200:
 *         description: Đã gọi người tiếp theo
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
 *                   example: Next person served
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     walletAddress:
 *                       type: string
 *       404:
 *         description: Không có ai trong hàng đợi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/:id/serve-next", ctrl.serveNext);

module.exports = router;
