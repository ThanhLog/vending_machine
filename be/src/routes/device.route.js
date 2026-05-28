const { Router } = require("express");
const ctrl = require("../controllers/device.controller");

const router = Router();

/**
 * @swagger
 * /api/device/machine:
 *   post:
 *     summary: Đăng ký máy bán hàng mới
 *     description: Đăng ký một máy bán hàng mới vào hệ thống (gọi từ ESP32 hoặc admin)
 *     tags: [Device]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - name
 *             properties:
 *               id:
 *                 type: string
 *                 description: Mã định danh máy
 *               name:
 *                 type: string
 *                 description: Tên máy
 *               location:
 *                 type: string
 *                 description: Địa chỉ máy
 *               latitude:
 *                 type: number
 *                 description: Vĩ độ (mặc định 21.0288)
 *               longitude:
 *                 type: number
 *                 description: Kinh độ (mặc định 105.854)
 *               isOnline:
 *                 type: boolean
 *                 description: Trạng thái online (mặc định true)
 *               temperature:
 *                 type: number
 *                 description: Nhiệt độ máy (mặc định 5.0)
 *               mode:
 *                 type: string
 *                 description: Chế độ hoạt động (mặc định "normal")
 *     responses:
 *       201:
 *         description: Máy được đăng ký thành công
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
 *                   example: Machine registered
 *                 data:
 *                   $ref: '#/components/schemas/Machine'
 *       400:
 *         description: Thiếu id hoặc name
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/machine", ctrl.registerMachine);

/**
 * @swagger
 * /api/device/machine/{id}:
 *   put:
 *     summary: Cập nhật thông tin máy bán hàng
 *     description: Cập nhật thông tin của máy bán hàng (trạng thái, nhiệt độ, v.v.)
 *     tags: [Device]
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
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               isOnline:
 *                 type: boolean
 *               temperature:
 *                 type: number
 *               mode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
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
 *                   $ref: '#/components/schemas/Machine'
 */
router.put("/machine/:id", ctrl.updateMachine);

/**
 * @swagger
 * /api/device/machine/{id}/slots:
 *   get:
 *     summary: Lấy danh sách khe hàng của máy
 *     description: Trả về tất cả khe hàng (slot) của một máy bán hàng
 *     tags: [Device]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Mã định danh máy
 *     responses:
 *       200:
 *         description: Danh sách khe hàng
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
router.get("/machine/:id/slots", ctrl.getSlots);

/**
 * @swagger
 * /api/device/machine/{id}/slots:
 *   post:
 *     summary: Cập nhật thông tin khe hàng
 *     description: Cập nhật thông tin sản phẩm, giá, trạng thái của một khe hàng
 *     tags: [Device]
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
 *               - slot
 *             properties:
 *               slot:
 *                 type: string
 *                 description: Số thứ tự khe hàng
 *               name:
 *                 type: string
 *                 description: Tên sản phẩm
 *               price:
 *                 type: string
 *                 description: Giá hiển thị
 *               priceETH:
 *                 type: number
 *                 description: Giá bằng ETH (mặc định 0.001)
 *               status:
 *                 type: string
 *                 description: Trạng thái (available / sold / reserved)
 *     responses:
 *       200:
 *         description: Cập nhật khe hàng thành công
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
 *                   $ref: '#/components/schemas/Slot'
 *       400:
 *         description: Thiếu tham số slot
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/machine/:id/slots", ctrl.updateSlot);

module.exports = router;
