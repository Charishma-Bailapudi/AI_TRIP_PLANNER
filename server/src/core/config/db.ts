import mongoose from "mongoose";
import { env } from "./env";
import { logger } from "../utils/logger";

export const connectDatabase = async (): Promise<void> => {
  const options: mongoose.ConnectOptions = {
    autoIndex: true,
    serverSelectionTimeoutMS: 5000,
  };

  mongoose.connection.on("connected", () => {
    logger.info("MongoDB connection established successfully.");
  });

  mongoose.connection.on("error", (error) => {
    logger.error(`MongoDB connection error: ${error}`);
  });

  mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB connection disconnected. Attempting to reconnect...");
  });

  try {
    logger.info("Attempting to connect to MongoDB...");
    await mongoose.connect(env.MONGODB_URI, options);
  } catch (error) {
    logger.error(`Failed to connect to MongoDB: ${error}`);
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info("MongoDB disconnected successfully.");
  } catch (error) {
    logger.error(`Error disconnecting from MongoDB: ${error}`);
  }
};
