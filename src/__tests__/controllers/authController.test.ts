// @ts-nocheck
import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { User } from "../../model/User";
import { getLoggedInUser, login } from "../../controllers/authController";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../../config";
import { CustomRequest } from "../../utils/interfaces";

// Mock bcrypt
jest.mock("bcrypt", () => ({
  compare: jest.fn(),
  hash: jest.fn().mockResolvedValue("hashed_password"),
}));

// Mock jwt
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));

// Mock logger
jest.mock("../../utils/logger", () => ({
  error: jest.fn(),
  info: jest.fn(),
}));

describe("Auth Controller", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe("login", () => {
    test("should login successfully with correct credentials", async () => {
      // Create a test user
      const hashedPassword = await bcrypt.hash("password123", 10);
      const user = await User.create({
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        password: hashedPassword,
      });

      // Mock bcrypt.compare to return true
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Mock jwt.sign to return a token
      const mockToken = "mock-jwt-token";
      (jwt.sign as jest.Mock).mockImplementation((payload, secret, options) => {
        // Verify the payload structure without strict type checking
        expect(payload).toHaveProperty("user");
        expect(payload.user).toHaveProperty("id");
        // Verify that the ID is either a string or an ObjectId
        expect(
          typeof payload.user.id === "string" ||
            payload.user.id instanceof mongoose.Types.ObjectId
        ).toBeTruthy();

        expect(secret).toBe(config.jwt.secret);
        expect(options).toEqual({ expiresIn: "1h" });

        return mockToken;
      });

      mockRequest.body = {
        email: "test@example.com",
        password: "password123",
      };

      await login(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "success",
        message: "Login successful",
        data: { token: mockToken },
      });

      // Verify that jwt.sign was called exactly once
      expect(jwt.sign).toHaveBeenCalledTimes(1);
    });

    test("should return error for non-existent user", async () => {
      mockRequest.body = {
        email: "nonexistent@example.com",
        password: "password123",
      };

      await login(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invalid credentials",
        })
      );
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    test("should return error for incorrect password", async () => {
      // Create a test user
      const hashedPassword = await bcrypt.hash("password123", 10);
      await User.create({
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        password: hashedPassword,
      });

      // Mock bcrypt.compare to return false
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      mockRequest.body = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      await login(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invalid credentials",
        })
      );
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });

  describe("getLoggedInUser", () => {
    test("should return user data for authenticated user", async () => {
      // Create a test user
      const user = await User.create({
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        password: "hashedPassword",
      });

      const customRequest = {
        user: { id: user._id.toString() },
      } as CustomRequest;

      await getLoggedInUser(customRequest, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "success",
        message: "User retrieved successfully",
        data: {
          user: expect.objectContaining({
            firstName: "Test",
            lastName: "User",
            email: "test@example.com",
          }),
        },
      });
    });

    test("should return error when user is not authenticated", async () => {
      const customRequest = {
        user: null,
      } as unknown as CustomRequest;

      await getLoggedInUser(customRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Not authenticated",
        })
      );
    });

    test("should return error when user ID is invalid", async () => {
      const customRequest = {
        user: { id: new mongoose.Types.ObjectId().toString() },
      } as CustomRequest;

      await getLoggedInUser(customRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "User not found",
        })
      );
    });
  });
});
