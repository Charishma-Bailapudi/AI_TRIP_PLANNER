import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validateRequest } from "../../core/middleware/validation.middleware";
import { requireAuth } from "../../core/middleware/auth.middleware";
import { registerSchema, loginSchema } from "../../../../shared/src/validation/auth.schema";

const router = Router();
const controller = new AuthController();

// Registration Endpoint
router.post("/register", validateRequest(registerSchema), controller.register);

// Login Endpoint
router.post("/login", validateRequest(loginSchema), controller.login);

// Profile Retrieval Endpoint (Protected)
router.get("/profile", requireAuth, controller.getProfile);

export default router;
