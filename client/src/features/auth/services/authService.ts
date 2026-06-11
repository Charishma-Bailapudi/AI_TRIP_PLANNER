import { apiClient } from "../../../services/apiClient";
import { RegisterInput, LoginInput } from "../../../../../shared/src/validation/auth.schema";
import { LoginResponseData, AuthUserResponse } from "../../../../../shared/src/types/user";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: unknown[];
}

export const authService = {
  /**
   * Sends user credentials to login endpoint
   */
  async login(payload: LoginInput): Promise<ApiResponse<LoginResponseData>> {
    return apiClient.post("/auth/login", payload);
  },

  /**
   * Sends user details to registration endpoint
   */
  async register(payload: RegisterInput): Promise<ApiResponse<AuthUserResponse>> {
    return apiClient.post("/auth/register", payload);
  },

  /**
   * Retrieves profile details for active session
   */
  async getProfile(): Promise<ApiResponse<AuthUserResponse>> {
    return apiClient.get("/auth/profile");
  },
};

export default authService;
