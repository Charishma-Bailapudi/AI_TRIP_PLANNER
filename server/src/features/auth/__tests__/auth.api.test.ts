import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../../app";
import { AuthService } from "../auth.service";
import { env } from "../../../core/config/env";

jest.mock("../auth.service");

describe("Auth Endpoints Integration Tests", () => {
  let mockAuthService: jest.Mocked<AuthService>;

  beforeEach(() => {
    mockAuthService = AuthService.prototype as jest.Mocked<AuthService>;
  });

  describe("POST /api/v1/auth/register", () => {
    it("should register successfully and return 201 on valid input parameters", async () => {
      const mockResult = {
        _id: "mock_id",
        email: "register@example.com",
        name: "New User",
        createdAt: new Date(),
      };
      mockAuthService.registerUser.mockResolvedValue(mockResult as any);

      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "New User",
          email: "register@example.com",
          password: "Password123!",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe("register@example.com");
      expect(mockAuthService.registerUser).toHaveBeenCalledWith({
        name: "New User",
        email: "register@example.com",
        passwordPlain: "Password123!",
      });
    });

    it("should return 400 Bad Request if email address is malformed", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "New User",
          email: "bad-email",
          password: "Password123!",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Validation failed");
      expect(res.body.errors[0].field).toBe("body.email");
    });
  });

  describe("POST /api/v1/auth/login", () => {
    it("should login successfully, return 200, and set the refresh token cookie", async () => {
      const mockResult = {
        accessToken: "access_token_mock",
        refreshToken: "refresh_token_mock",
        user: {
          userId: "user_mock_id",
          email: "login@example.com",
          name: "Active User",
        },
      };
      mockAuthService.loginUser.mockResolvedValue(mockResult);

      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "login@example.com",
          password: "Password123!",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBe("access_token_mock");
      expect(res.header["set-cookie"]).toBeDefined();
      expect(res.header["set-cookie"][0]).toContain("refreshToken=refresh_token_mock");
    });
  });

  describe("GET /api/v1/auth/profile", () => {
    it("should return 401 Unauthorized if authorization header is missing", async () => {
      const res = await request(app).get("/api/v1/auth/profile");
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should return profile details on valid JWT access token", async () => {
      const mockUser = {
        _id: "user_mock_id",
        email: "profile@example.com",
        name: "Profile User",
        createdAt: new Date(),
      };
      mockAuthService.getUserProfile.mockResolvedValue(mockUser as any);

      // Sign a mock token matching signature criteria
      const token = jwt.sign(
        { userId: "user_mock_id", email: "profile@example.com" },
        env.JWT_SECRET,
      );

      const res = await request(app)
        .get("/api/v1/auth/profile")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe("profile@example.com");
      expect(mockAuthService.getUserProfile).toHaveBeenCalledWith("user_mock_id");
    });
  });
});
