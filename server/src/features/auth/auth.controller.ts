import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * HTTP Handler for User Registration
   */
  public register = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { name, email, password } = req.body;
      const user = await this.authService.registerUser({
        name,
        email,
        passwordPlain: password,
      });

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          userId: user._id.toString(),
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * HTTP Handler for User Login
   */
  public login = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { email, password } = req.body;
      const result = await this.authService.loginUser({
        email,
        passwordPlain: password,
      });

      // Set cookie for Refresh Token
      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      });

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          accessToken: result.accessToken,
          expiresInSeconds: 900, // 15 minutes
          user: result.user,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * HTTP Handler for User Profile retrieval
   */
  public getProfile = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized - User details missing in session context",
          errors: [],
        });
        return;
      }

      const user = await this.authService.getUserProfile(userId);
      res.status(200).json({
        success: true,
        message: "Profile fetched successfully",
        data: {
          userId: user._id.toString(),
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
export default AuthController;
