const { Router } = require("express");
const path = require("path");
const firebaseService = require("../services/firebase.service");
const { success, error } = require("../utils/response");

const router = Router();

// ── Admin password (có thể đổi qua env) ────────────
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

// Middleware check password
function checkAuth(req, res, next) {
  const auth = req.headers["authorization"];
  if (auth === `Bearer ${ADMIN_PASSWORD}`) return next();

  // Cũng check query param cho web page
  const token = req.query.token;
  if (token === ADMIN_PASSWORD) return next();

  return res.status(401).json({ success: false, message: "Unauthorized" });
}

// ── Serve admin page ───────────────────────────────
function serveAdmin(req, res) {
  const token = req.query.token;
  if (token !== ADMIN_PASSWORD) {
    return res.send(loginPage());
  }
  return res.sendFile(path.join(__dirname, "..", "public", "admin.html"));
}
router.get("/", serveAdmin);
router.get("", serveAdmin);

// ── API: Get all machines (for dropdown) ────────────
router.get("/machines", checkAuth, async (req, res) => {
  try {
    const machines = await firebaseService.getAllMachines();
    return success(res, machines);
  } catch (err) {
    return error(res, err.message);
  }
});

// ── API: Get slots of a machine ─────────────────────
router.get("/machine/:id/slots", checkAuth, async (req, res) => {
  try {
    const slots = await firebaseService.getSlots(req.params.id);
    return success(res, slots);
  } catch (err) {
    return error(res, err.message);
  }
});

// ── API: Add/Update slot ────────────────────────────
router.post("/machine/:id/slots", checkAuth, async (req, res) => {
  try {
    const { slot, name, price, priceETH, status, quantity } = req.body;
    if (!slot) return error(res, "slot is required", 400);

    const qty = quantity != null ? parseInt(quantity) : 1;

    await firebaseService.updateSlot(req.params.id, String(slot), {
      slot: String(slot),
      name: name || "",
      price: price || "",
      priceETH: priceETH || 0.001,
      status: status || "available",
      quantity: qty,
      updatedAt: new Date().toISOString(),
    });

    // If admin sets a slot to available with quantity > 0, bring machine back online
    if (status === "available" && qty > 0) {
      await firebaseService.upsertMachine(req.params.id, { mode: "normal", isOnline: true });
    }

    return success(res, { slot, name, price, priceETH, status, quantity: qty }, "Slot updated");
  } catch (err) {
    return error(res, err.message);
  }
});

// ── API: Delete slot ────────────────────────────────
router.delete("/machine/:id/slots/:slot", checkAuth, async (req, res) => {
  try {
    await firebaseService.updateSlot(req.params.id, req.params.slot, {
      status: "unavailable",
      updatedAt: new Date().toISOString(),
    });
    return success(res, null, "Slot removed");
  } catch (err) {
    return error(res, err.message);
  }
});

// ═══════════════════════════════════════════════════════
// ── Device Management APIs ────────────────────────────
// ═══════════════════════════════════════════════════════

// ── API: Get all devices ──────────────────────────────
router.get("/devices", checkAuth, async (req, res) => {
  try {
    const devices = await firebaseService.getAllMachines();
    return success(res, devices);
  } catch (err) {
    return error(res, err.message);
  }
});

// ── API: Create device ────────────────────────────────
router.post("/devices", checkAuth, async (req, res) => {
  try {
    const { id, name, location, latitude, longitude, isOnline, temperature, mode, ssid, password } = req.body;
    if (!id) return error(res, "Device ID is required", 400);
    if (!name) return error(res, "Device name is required", 400);

    const device = await firebaseService.upsertMachine(id, {
      name,
      location: location || "",
      latitude: latitude != null ? parseFloat(latitude) : 21.0288,
      longitude: longitude != null ? parseFloat(longitude) : 105.854,
      isOnline: isOnline ?? true,
      temperature: temperature != null ? parseFloat(temperature) : 5.0,
      products: 0,
      mode: mode || "normal",
      ssid: ssid || "Vending_Setup",
      password: password || "12345678",
      createdAt: new Date().toISOString(),
    });
    return success(res, device, "Device created", 201);
  } catch (err) {
    return error(res, err.message);
  }
});

// ── API: Update device ────────────────────────────────
router.put("/devices/:id", checkAuth, async (req, res) => {
  try {
    const { id, name, location, latitude, longitude, isOnline, temperature, mode, ssid, password } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (location !== undefined) updateData.location = location;
    if (latitude !== undefined) updateData.latitude = parseFloat(latitude);
    if (longitude !== undefined) updateData.longitude = parseFloat(longitude);
    if (isOnline !== undefined) updateData.isOnline = isOnline;
    if (temperature !== undefined) updateData.temperature = parseFloat(temperature);
    if (mode !== undefined) updateData.mode = mode;
    if (ssid !== undefined) updateData.ssid = ssid;
    if (password !== undefined) updateData.password = password;

    const device = await firebaseService.upsertMachine(req.params.id, {
      ...updateData,
      updatedAt: new Date().toISOString(),
    });
    return success(res, device, "Device updated");
  } catch (err) {
    return error(res, err.message);
  }
});

// ── API: Delete device ────────────────────────────────
router.delete("/devices/:id", checkAuth, async (req, res) => {
  try {
    await firebaseService.deleteMachine(req.params.id);
    return success(res, null, "Device deleted");
  } catch (err) {
    return error(res, err.message);
  }
});

// ═══════════════════════════════════════════════════════
// ── Order / Purchase Management APIs ───────────────────
// ═══════════════════════════════════════════════════════

// ── API: Get all orders (with filters) ─────────────────
router.get("/orders", checkAuth, async (req, res) => {
  try {
    const { machineId, status, page, limit } = req.query;
    const pageNum = parseInt(page) || 1;
    const limitNum = Math.min(parseInt(limit) || 50, 200);

    const result = await firebaseService.getOrders({
      machineId: machineId || null,
      status: status || null,
      page: pageNum,
      limit: limitNum,
    });
    return success(res, result);
  } catch (err) {
    return error(res, err.message);
  }
});

// ── API: Get order stats / summary ─────────────────────
router.get("/orders/stats", checkAuth, async (req, res) => {
  try {
    const stats = await firebaseService.getOrderStats();
    return success(res, stats);
  } catch (err) {
    return error(res, err.message);
  }
});

// ── API: Update order status ───────────────────────────
router.put("/orders/:id/status", checkAuth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !["dispensed", "failed", "confirmed"].includes(status)) {
      return error(res, "status must be one of: dispensed, failed, confirmed", 400);
    }
    await firebaseService.updateOrderStatus(req.params.id, status);
    return success(res, null, `Order ${req.params.id} -> ${status}`);
  } catch (err) {
    return error(res, err.message);
  }
});

// ── Login page ──────────────────────────────────────
function loginPage() {
  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Admin Login - Vending Machine</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:Arial,sans-serif;background:#0f172a;display:flex;align-items:center;justify-content:center;height:100vh;color:#fff}
    .box{background:#1e293b;padding:40px;border-radius:16px;width:360px;text-align:center}
    h1{font-size:22px;margin-bottom:24px}
    input{width:100%;padding:14px;border:1px solid #334155;border-radius:8px;background:#0f172a;color:#fff;font-size:16px;margin-bottom:16px}
    button{width:100%;padding:14px;border:0;border-radius:8px;background:#06b6d4;color:#000;font-size:16px;font-weight:bold;cursor:pointer}
    .err{color:#f87171;margin-top:12px;font-size:13px}
  </style>
</head>
<body>
  <div class="box">
    <h1>🔐 Admin Login</h1>
    <form onsubmit="login(event)">
      <input type="password" id="pass" placeholder="Nhap mat khau admin" autofocus>
      <button type="submit">Dang nhap</button>
      <div class="err" id="err"></div>
    </form>
  </div>
  <script>
    function login(e) {
      e.preventDefault();
      const pass = document.getElementById('pass').value;
      if (!pass) return;
      window.location.href = '?token=' + encodeURIComponent(pass);
    }
  </script>
</body>
</html>`;
}

module.exports = router;
