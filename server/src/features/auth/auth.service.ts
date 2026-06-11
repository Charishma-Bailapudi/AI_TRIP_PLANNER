import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AuthRepository } from "./auth.repository";
import { IUserDocument } from "./auth.model";
import { env } from "../../core/config/env";

export class AuthService {
  private authRepository: AuthRepository;

  constructor() {
    this.authRepository = new AuthRepository();
  }

  /**
   * Registers a new user.
   */
  public async registerUser(data: {
    name: string;
    email: string;
    passwordPlain: string;
  }): Promise<IUserDocument> {
    const existingUser = await this.authRepository.findByEmail(data.email);
    if (existingUser) {
      const error: any = new Error("Email is already in use");
      error.statusCode = 400;
      throw error;
    }

    // Hash password with salt rounds = 10
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.passwordPlain, salt);

    return await this.authRepository.createUser({
      email: data.email,
      name: data.name,
      passwordHash,
    });
  }

  /**
   * Validates user credentials and issues Access/Refresh JWT tokens.
   */
  public async loginUser(data: {
    email: string;
    passwordPlain: string;
  }): Promise<{
    accessToken: string;
    refreshToken: string;
    user: { userId: string; email: string; name: string };
  }> {
    const user = await this.authRepository.findByEmail(data.email);
    if (!user) {
      const error: any = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await bcrypt.compare(data.passwordPlain, user.passwordHash);
    if (!isMatch) {
      const error: any = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    // Generate JWT token pair
    const accessToken = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      env.JWT_SECRET,
      { expiresIn: env.JWT_ACCESS_EXPIRATION as any },
    );

    const refreshToken = jwt.sign(
      { userId: user._id.toString() },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRATION as any },
    );

    return {
      accessToken,
      refreshToken,
      user: {
        userId: user._id.toString() as string,
        email: user.email,
        name: user.name,
      },
    };
  }

  /**
   * Retrieves profile details for a validated user ID.
   */
  public async getUserProfile(userId: string): Promise<IUserDocument> {
    const user = await this.authRepository.findById(userId);
    if (!user) {
      const error: any = new Error("User profile not found");
      error.statusCode = 404;
      throw error;
    }
    return user;
  }
}
export default AuthService;
