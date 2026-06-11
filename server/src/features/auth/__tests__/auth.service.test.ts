import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AuthService } from "../auth.service";
import { AuthRepository } from "../auth.repository";

jest.mock("../auth.repository");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

describe("AuthService Unit Tests", () => {
  let authService: AuthService;
  let mockRepository: jest.Mocked<AuthRepository>;

  beforeEach(() => {
    mockRepository = new AuthRepository() as jest.Mocked<AuthRepository>;
    authService = new AuthService();
    (authService as any).authRepository = mockRepository;
  });

  describe("registerUser", () => {
    it("should successfully hash the password and create a user", async () => {
      const mockInput = {
        name: "John Doe",
        email: "john@example.com",
        passwordPlain: "Password123!",
      };

      mockRepository.findByEmail.mockResolvedValue(null);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue("mock_salt");
      (bcrypt.hash as jest.Mock).mockResolvedValue("mock_hashed_password");
      mockRepository.createUser.mockResolvedValue({
        _id: "mock_user_id",
        email: mockInput.email,
        name: mockInput.name,
        passwordHash: "mock_hashed_password",
        isDeleted: false,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const result = await authService.registerUser(mockInput);

      expect(mockRepository.findByEmail).toHaveBeenCalledWith(mockInput.email);
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith(mockInput.passwordPlain, "mock_salt");
      expect(mockRepository.createUser).toHaveBeenCalledWith({
        email: mockInput.email,
        name: mockInput.name,
        passwordHash: "mock_hashed_password",
      });
      expect(result.email).toBe(mockInput.email);
    });

    it("should throw a 400 Bad Request error if the email is already registered", async () => {
      const mockInput = {
        name: "John Doe",
        email: "john@example.com",
        passwordPlain: "Password123!",
      };

      mockRepository.findByEmail.mockResolvedValue({ _id: "existing_id" } as any);

      await expect(authService.registerUser(mockInput)).rejects.toThrow("Email is already in use");
      expect(mockRepository.createUser).not.toHaveBeenCalled();
    });
  });

  describe("loginUser", () => {
    it("should verify credentials and return access and refresh tokens", async () => {
      const mockInput = {
        email: "john@example.com",
        passwordPlain: "Password123!",
      };

      const mockUser = {
        _id: "mock_user_id",
        email: "john@example.com",
        name: "John Doe",
        passwordHash: "mock_hashed_password",
      };

      mockRepository.findByEmail.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock)
        .mockReturnValueOnce("mock_access_token")
        .mockReturnValueOnce("mock_refresh_token");

      const result = await authService.loginUser(mockInput);

      expect(mockRepository.findByEmail).toHaveBeenCalledWith(mockInput.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(mockInput.passwordPlain, "mock_hashed_password");
      expect(jwt.sign).toHaveBeenCalledTimes(2);
      expect(result.accessToken).toBe("mock_access_token");
      expect(result.refreshToken).toBe("mock_refresh_token");
      expect(result.user.userId).toBe("mock_user_id");
    });

    it("should throw a 401 error if user is not found", async () => {
      mockRepository.findByEmail.mockResolvedValue(null);

      await expect(
        authService.loginUser({ email: "wrong@example.com", passwordPlain: "123" }),
      ).rejects.toThrow("Invalid email or password");
    });

    it("should throw a 401 error if password verification fails", async () => {
      mockRepository.findByEmail.mockResolvedValue({ passwordHash: "hash" } as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.loginUser({ email: "john@example.com", passwordPlain: "wrong_pass" }),
      ).rejects.toThrow("Invalid email or password");
    });
  });
});
