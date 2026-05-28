const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Smart Vending Machine API",
      version: "1.0.0",
      description:
        "API cho hệ thống máy bán hàng tự động sử dụng blockchain. Hỗ trợ xác thực qua ví Ethereum, quản lý máy, hàng đợi mua hàng thời gian thực, và thanh toán qua blockchain.",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
    tags: [
      { name: "Auth", description: "Xác thực người dùng bằng ví blockchain" },
      { name: "Vending", description: "API cho người dùng — xem máy, tham gia hàng đợi, kiểm tra trạng thái" },
      { name: "Device", description: "Quản lý máy bán hàng (dành cho thiết bị ESP32 / admin)" },
      { name: "Product", description: "Mua hàng và xem sản phẩm theo máy" },
      { name: "Wallet", description: "Quản lý ví — số dư và lịch sử giao dịch" },
    ],
    components: {
      schemas: {
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Error message" },
          },
        },
        Machine: {
          type: "object",
          properties: {
            id: { type: "string", description: "Mã định danh máy" },
            name: { type: "string", description: "Tên máy" },
            location: { type: "string", description: "Địa chỉ máy" },
            latitude: { type: "number", description: "Vĩ độ" },
            longitude: { type: "number", description: "Kinh độ" },
            isOnline: { type: "boolean", description: "Trạng thái online" },
            temperature: { type: "number", description: "Nhiệt độ máy (°C)" },
            products: { type: "integer", description: "Số lượng sản phẩm" },
            mode: { type: "string", description: "Chế độ hoạt động" },
          },
        },
        Slot: {
          type: "object",
          properties: {
            slot: { type: "string", description: "Số thứ tự khe hàng" },
            name: { type: "string", description: "Tên sản phẩm" },
            price: { type: "string", description: "Giá hiển thị" },
            priceETH: { type: "number", description: "Giá bằng ETH" },
            status: { type: "string", description: "Trạng thái (available / sold / reserved)" },
          },
        },
        MachineDetail: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            location: { type: "string" },
            latitude: { type: "number" },
            longitude: { type: "number" },
            isOnline: { type: "boolean" },
            temperature: { type: "number" },
            mode: { type: "string" },
            slots: { type: "array", items: { $ref: "#/components/schemas/Slot" } },
          },
        },
        QueueEntry: {
          type: "object",
          properties: {
            id: { type: "string", description: "ID của entry trong hàng đợi" },
            walletAddress: { type: "string", description: "Địa chỉ ví người dùng" },
            position: { type: "integer", description: "Vị trí trong hàng đợi" },
            joinedAt: { type: "string", description: "Thời gian tham gia" },
            status: { type: "string", description: "Trạng thái (waiting / serving / completed / expired)" },
          },
        },
        Order: {
          type: "object",
          properties: {
            id: { type: "string" },
            machineId: { type: "string" },
            slot: { type: "string" },
            productName: { type: "string" },
            txHash: { type: "string" },
            walletAddress: { type: "string" },
            amount: { type: "string" },
            createdAt: { type: "string" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

function swaggerDocs(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

module.exports = swaggerDocs;
