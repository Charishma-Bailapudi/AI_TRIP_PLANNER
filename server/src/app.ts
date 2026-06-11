import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { errorHandler } from "./core/middleware/error";
import authRoutes from "./features/auth/auth.routes";

const app: Express = express();

// Security Middlewares
app.use(helmet());
app.use(cors());

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Feature Routes
app.use("/api/v1/auth", authRoutes);

// Base Route
app.get("/", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "AI Trip Planner API Server is running",
    data: {
      version: "1.0.0",
    },
  });
});

// Health Check Endpoint
app.get("/api/v1/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Healthy",
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});

// Global Error Handler
app.use(errorHandler);

export default app;
