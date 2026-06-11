import app from "./app";
import { env } from "./core/config/env";
import { connectDatabase, disconnectDatabase } from "./core/config/db";
import { logger } from "./core/utils/logger";

const server = app.listen(env.PORT, async () => {
  logger.info("🚀 Server starting...");
  await connectDatabase();
  logger.info(`⚡ Server listening at http://localhost:${env.PORT}`);
});

// Graceful Shutdown Handler
const handleGracefulShutdown = async (signal: string): Promise<void> => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  server.close(async () => {
    logger.info("HTTP server closed.");
    await disconnectDatabase();
    logger.info("Graceful shutdown complete. Exiting process.");
    process.exit(0);
  });

  // Force close after 10s timeout
  setTimeout(() => {
    logger.error("Could not close connections in time, forcefully shutting down");
    process.exit(1);
  }, 10000);
};

process.on("SIGINT", () => handleGracefulShutdown("SIGINT"));
process.on("SIGTERM", () => handleGracefulShutdown("SIGTERM"));

process.on("unhandledRejection", (reason) => {
  logger.error(`Unhandled Rejection: ${reason}`);
});

process.on("uncaughtException", (error) => {
  logger.error(`Uncaught Exception: ${error.message}`);
  handleGracefulShutdown("uncaughtException");
});
