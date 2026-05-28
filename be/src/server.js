const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const env = require("./config/env");
const logger = require("./utils/logger");
const notificationService = require("./services/notification.service");

const swaggerDocs = require("./docs/swagger");
const server = http.createServer(app);


// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Initialize notification service with socket.io
notificationService.init(io);

// Socket.io connection handling
io.on("connection", (socket) => {
  logger.info("Client connected:", socket.id);

  // Join a queue room for real-time updates
  socket.on("join_queue", (machineId) => {
    socket.join(`queue:${machineId}`);
    logger.info(`Socket ${socket.id} joined queue:${machineId}`);
  });

  // Join a machine room for purchase updates
  socket.on("join_machine", (machineId) => {
    socket.join(`machine:${machineId}`);
    logger.info(`Socket ${socket.id} joined machine:${machineId}`);
  });

  // Leave rooms
  socket.on("leave_queue", (machineId) => {
    socket.leave(`queue:${machineId}`);
  });

  socket.on("leave_machine", (machineId) => {
    socket.leave(`machine:${machineId}`);
  });

  socket.on("disconnect", () => {
    logger.info("Client disconnected:", socket.id);
  });
});

// Queue timeout checker: runs every 30 seconds (only when DB is available)
const db = require("./config/firebase");
if (db) {
  setInterval(async () => {
    try {
      const firebaseService = require("./services/firebase.service");
      const machines = await firebaseService.getAllMachines();

      for (const machine of machines) {
        const serving = await firebaseService.getCurrentServing(machine.id);
        if (serving && serving.expiresAt) {
          const expiresAt = new Date(serving.expiresAt);
          if (expiresAt < new Date()) {
            await firebaseService.expireQueueEntry(machine.id, serving.id);
            notificationService.notifyTurnExpired(machine.id, serving.id, serving.walletAddress);
            notificationService.notifyQueueUpdate(machine.id, { currentServing: null });

            // Auto serve next
            const next = await firebaseService.serveNext(machine.id);
            if (next) {
              notificationService.notifyTurnReady(machine.id, next.id, next.walletAddress, next.expiresAt);
            }

            logger.info("Queue entry expired:", serving.id, "machine:", machine.id);
          }
        }
      }
    } catch (err) {
      logger.error("Queue timeout checker error:", err.message);
    }
  }, 30000);
}

server.listen(env.PORT, () => {
  logger.info(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
  logger.info(`WebSocket ready for real-time queue updates`);
});

module.exports = server;
