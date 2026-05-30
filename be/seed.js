/**
 * Seed script: tạo dữ liệu fake cho vending machines + slots.
 * Chạy: node seed.js
 */
require("dotenv").config({ path: __dirname + "/.env" });
const admin = require("firebase-admin");
const env = require("./src/config/env");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY.split(String.fromCharCode(92) + "n").join("\n"),
    }),
  });
}

const db = admin.firestore();

const MACHINES = [
  {
    id: "machine-hanoi-01",
    name: "Vending Machine Hanoi 01",
    location: "Số 1 Hoàn Kiếm, Hà Nội",
    latitude: 21.0288,
    longitude: 105.8540,
    isOnline: true,
    temperature: 4.5,
    products: 0,
    mode: "normal",
    slots: [
      { slot: "1", name: "Coca Cola",       price: "15000 VND",  priceETH: 0.001,  status: "available" },
      { slot: "2", name: "Pepsi",           price: "14000 VND",  priceETH: 0.0009, status: "available" },
      { slot: "3", name: "Sting Đỏ",        price: "12000 VND",  priceETH: 0.0008, status: "available" },
      { slot: "4", name: "Red Bull",        price: "20000 VND",  priceETH: 0.0013, status: "available" },
      { slot: "5", name: "Nước Suối",       price: "5000 VND",   priceETH: 0.0003, status: "available" },
      { slot: "6", name: "Trà Xanh C2",     price: "10000 VND",  priceETH: 0.0007, status: "available" },
    ],
  },
  {
    id: "machine-hanoi-02",
    name: "Vending Machine Hanoi 02",
    location: "Số 258 Cầu Giấy, Hà Nội",
    latitude: 21.0375,
    longitude: 105.7825,
    isOnline: true,
    temperature: 5.0,
    products: 0,
    mode: "normal",
    slots: [
      { slot: "1", name: "Coca Cola",       price: "15000 VND",  priceETH: 0.001,  status: "available" },
      { slot: "2", name: "Fanta Cam",       price: "14000 VND",  priceETH: 0.0009, status: "available" },
      { slot: "3", name: "7Up",             price: "14000 VND",  priceETH: 0.0009, status: "available" },
      { slot: "4", name: "Bò Húc",          price: "20000 VND",  priceETH: 0.0013, status: "sold_out" },
      { slot: "5", name: "Nước Khoáng",     price: "5000 VND",   priceETH: 0.0003, status: "available" },
      { slot: "6", name: "Cà Phê Sữa",      price: "18000 VND",  priceETH: 0.0012, status: "available" },
    ],
  },
  {
    id: "machine-hcm-01",
    name: "Vending Machine HCM 01",
    location: "Số 123 Nguyễn Huệ, Quận 1, TP.HCM",
    latitude: 10.7757,
    longitude: 106.7054,
    isOnline: false,
    temperature: 3.8,
    products: 0,
    mode: "maintenance",
    slots: [
      { slot: "1", name: "Coca Cola",       price: "15000 VND",  priceETH: 0.001,  status: "available" },
      { slot: "2", name: "Pepsi",           price: "14000 VND",  priceETH: 0.0009, status: "sold_out" },
      { slot: "3", name: "Mirinda",         price: "14000 VND",  priceETH: 0.0009, status: "available" },
      { slot: "4", name: "Red Bull",        price: "20000 VND",  priceETH: 0.0013, status: "available" },
      { slot: "5", name: "Aquafina",        price: "5000 VND",   priceETH: 0.0003, status: "available" },
      { slot: "6", name: "Olong Tea",       price: "10000 VND",  priceETH: 0.0007, status: "sold_out" },
    ],
  },
  {
    id: "machine-hanoi-03",
    name: "Vending Machine Hanoi 03",
    location: "Số 55 Giải Phóng, Hai Bà Trưng, Hà Nội",
    latitude: 21.0079,
    longitude: 105.8437,
    isOnline: true,
    temperature: 4.2,
    products: 0,
    mode: "normal",
    slots: [
      { slot: "1", name: "Coca Cola",       price: "15000 VND",  priceETH: 0.001,  status: "available" },
      { slot: "2", name: "Sprite",          price: "14000 VND",  priceETH: 0.0009, status: "available" },
      { slot: "3", name: "Nước Ép Cam",     price: "18000 VND",  priceETH: 0.0012, status: "available" },
      { slot: "4", name: "Red Bull",        price: "20000 VND",  priceETH: 0.0013, status: "sold_out" },
      { slot: "5", name: "Sữa Milo",        price: "17000 VND",  priceETH: 0.0011, status: "available" },
      { slot: "6", name: "Snack Khoai Tây", price: "7000 VND",   priceETH: 0.0005, status: "available" },
    ],
  },
  {
    id: "machine-hanoi-04",
    name: "Vending Machine Hanoi 04",
    location: "Số 100 Xuân Thủy, Cầu Giấy, Hà Nội",
    latitude: 21.0364,
    longitude: 105.7760,
    isOnline: true,
    temperature: 5.1,
    products: 0,
    mode: "normal",
    slots: [
      { slot: "1", name: "Cà Phê Đen",      price: "12000 VND",  priceETH: 0.0008, status: "available" },
      { slot: "2", name: "Bia Tiger",       price: "20000 VND",  priceETH: 0.0013, status: "available" },
      { slot: "3", name: "Nước Tăng Lực",   price: "15000 VND",  priceETH: 0.001,  status: "available" },
      { slot: "4", name: "Trà Sữa",         price: "22000 VND",  priceETH: 0.0015, status: "available" },
      { slot: "5", name: "Bánh Oreo",       price: "6000 VND",   priceETH: 0.0004, status: "sold_out" },
      { slot: "6", name: "Nước Khoáng",     price: "5000 VND",   priceETH: 0.0003, status: "available" },
    ],
  },
  {
    id: "machine-hanoi-05",
    name: "Vending Machine Hanoi 05",
    location: "Khu vực Hà Đông, Hà Nội",
    latitude: 20.957741,
    longitude: 105.732028,
    isOnline: true,
    temperature: 4.5,
    products: 0,
    mode: "normal",
    slots: [
      { slot: "1", name: "Coca Cola",       price: "15000 VND",  priceETH: 0.001,  status: "available" },
      { slot: "2", name: "Pepsi",           price: "14000 VND",  priceETH: 0.0009, status: "available" },
      { slot: "3", name: "Sting Đỏ",        price: "12000 VND",  priceETH: 0.0008, status: "available" },
      { slot: "4", name: "Red Bull",        price: "20000 VND",  priceETH: 0.0013, status: "available" },
      { slot: "5", name: "Nước Suối",       price: "5000 VND",   priceETH: 0.0003, status: "available" },
      { slot: "6", name: "Trà Xanh C2",     price: "10000 VND",  priceETH: 0.0007, status: "available" },
    ],
  },
  {
    id: "machine-hcm-02",
    name: "Vending Machine HCM 02",
    location: "Số 456 Lê Văn Việt, Quận 9, TP.HCM",
    latitude: 10.8471,
    longitude: 106.7806,
    isOnline: true,
    temperature: 4.0,
    products: 0,
    mode: "normal",
    slots: [
      { slot: "1", name: "Pepsi",           price: "14000 VND",  priceETH: 0.0009, status: "available" },
      { slot: "2", name: "Coca Cola",       price: "15000 VND",  priceETH: 0.001,  status: "available" },
      { slot: "3", name: "Sting Vàng",      price: "12000 VND",  priceETH: 0.0008, status: "available" },
      { slot: "4", name: "Trà Đào",         price: "16000 VND",  priceETH: 0.0011, status: "sold_out" },
      { slot: "5", name: "Nước Suối",       price: "5000 VND",   priceETH: 0.0003, status: "available" },
      { slot: "6", name: "Kẹo Cao Su",      price: "3000 VND",   priceETH: 0.0002, status: "available" },
    ],
  },
  {
    id: "machine-hcm-03",
    name: "Vending Machine HCM 03",
    location: "Số 789 Điện Biên Phủ, Quận 10, TP.HCM",
    latitude: 10.7733,
    longitude: 106.6720,
    isOnline: false,
    temperature: 0.0,
    products: 0,
    mode: "maintenance",
    slots: [
      { slot: "1", name: "Coca Cola",       price: "15000 VND",  priceETH: 0.001,  status: "available" },
      { slot: "2", name: "Fanta Dâu",       price: "14000 VND",  priceETH: 0.0009, status: "available" },
      { slot: "3", name: "Red Bull",        price: "20000 VND",  priceETH: 0.0013, status: "available" },
      { slot: "4", name: "Trà Bí Đao",      price: "10000 VND",  priceETH: 0.0007, status: "available" },
      { slot: "5", name: "Snack Tôm",       price: "8000 VND",   priceETH: 0.0005, status: "available" },
      { slot: "6", name: "Sữa Đậu Nành",    price: "9000 VND",   priceETH: 0.0006, status: "available" },
    ],
  },
  {
    id: "machine-danang-01",
    name: "Vending Machine Da Nang 01",
    location: "Số 10 Bạch Đằng, Hải Châu, Đà Nẵng",
    latitude: 16.0660,
    longitude: 108.2245,
    isOnline: true,
    temperature: 4.7,
    products: 0,
    mode: "normal",
    slots: [
      { slot: "1", name: "Coca Cola",       price: "15000 VND",  priceETH: 0.001,  status: "available" },
      { slot: "2", name: "Pepsi",           price: "14000 VND",  priceETH: 0.0009, status: "available" },
      { slot: "3", name: "Bò Húc",          price: "20000 VND",  priceETH: 0.0013, status: "available" },
      { slot: "4", name: "Trà Xanh C2",     price: "10000 VND",  priceETH: 0.0007, status: "available" },
      { slot: "5", name: "Nước Khoáng",     price: "5000 VND",   priceETH: 0.0003, status: "sold_out" },
      { slot: "6", name: "Bánh Chocopie",   price: "6000 VND",   priceETH: 0.0004, status: "available" },
    ],
  },
  {
    id: "machine-danang-02",
    name: "Vending Machine Da Nang 02",
    location: "Số 77 Nguyễn Văn Linh, Hải Châu, Đà Nẵng",
    latitude: 16.0544,
    longitude: 108.2187,
    isOnline: true,
    temperature: 4.3,
    products: 0,
    mode: "normal",
    slots: [
      { slot: "1", name: "7Up",             price: "14000 VND",  priceETH: 0.0009, status: "available" },
      { slot: "2", name: "Mirinda Cam",     price: "14000 VND",  priceETH: 0.0009, status: "available" },
      { slot: "3", name: "Cà Phê Sữa Đá",   price: "18000 VND",  priceETH: 0.0012, status: "sold_out" },
      { slot: "4", name: "Nước Cam Ép",     price: "18000 VND",  priceETH: 0.0012, status: "available" },
      { slot: "5", name: "Aquafina",        price: "5000 VND",   priceETH: 0.0003, status: "available" },
      { slot: "6", name: "Mì Ly",           price: "12000 VND",  priceETH: 0.0008, status: "available" },
    ],
  },
  {
    id: "machine-danang-03",
    name: "Vending Machine Da Nang 03",
    location: "Số 200 Ngũ Hành Sơn, Ngũ Hành Sơn, Đà Nẵng",
    latitude: 16.0100,
    longitude: 108.2564,
    isOnline: false,
    temperature: 0.0,
    products: 0,
    mode: "offline",
    slots: [
      { slot: "1", name: "Coca Cola",       price: "15000 VND",  priceETH: 0.001,  status: "available" },
      { slot: "2", name: "Pepsi",           price: "14000 VND",  priceETH: 0.0009, status: "available" },
      { slot: "3", name: "Sting Đỏ",        price: "12000 VND",  priceETH: 0.0008, status: "available" },
      { slot: "4", name: "Red Bull",        price: "20000 VND",  priceETH: 0.0013, status: "available" },
      { slot: "5", name: "Nước Suối",       price: "5000 VND",   priceETH: 0.0003, status: "available" },
      { slot: "6", name: "Bim Bim",         price: "7000 VND",   priceETH: 0.0005, status: "available" },
    ],
  },
];

async function seed() {
  console.log("[seed] Bắt đầu seed dữ liệu...\n");

  for (const machine of MACHINES) {
    const { id, slots, ...machineData } = machine;

    // Upsert machine
    await db.collection("vending_machines").doc(id).set({
      ...machineData,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    console.log(`  [✓] Machine: ${machineData.name} (${id})`);

    // Seed slots
    for (const slot of slots) {
      await db
        .collection("vending_machines")
        .doc(id)
        .collection("slots")
        .doc(slot.slot)
        .set({
          slot: slot.slot,
          name: slot.name,
          price: slot.price,
          priceETH: slot.priceETH,
          status: slot.status,
          updatedAt: new Date().toISOString(),
        });
    }
    console.log(`       → ${slots.length} slots đã được tạo`);

    // Đếm số sản phẩm available
    const availableCount = slots.filter((s) => s.status === "available").length;
    await db.collection("vending_machines").doc(id).update({ products: availableCount });
  }

  console.log(`\n[seed] Hoàn tất! ${MACHINES.length} máy đã được tạo.`);
}

seed().catch((err) => {
  console.error("[seed] Lỗi:", err.message);
  process.exit(1);
});
