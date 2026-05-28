const express = require("express");
const cors = require("cors");
const { notFound, errorHandler } = require("./middleware/error.middleware");
const swaggerDocs = require("./docs/swagger");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
swaggerDocs(app);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/auth", require("./routes/auth.route"));
app.use("/api/device", require("./routes/device.route"));
app.use("/api/vending", require("./routes/vending.route"));
app.use("/api/wallet", require("./routes/wallet.route"));
app.use("/api/product", require("./routes/product.route"));
app.use("/api/command", require("./routes/command.route"));

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;

