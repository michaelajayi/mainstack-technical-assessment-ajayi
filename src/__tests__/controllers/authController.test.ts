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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("login", () => {
    it("should login successfully with correct credentials", async () => {
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
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      const mockRequest = {
        body: {
          email: "test@example.com",
          password: "password123",
        },
      } as Request;
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;
      const mockNext = jest.fn() as NextFunction;

      await login(mockRequest, mockResponse, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "success",
        message: "Login successful",
        data: { token: mockToken },
      });

      // Verify JWT was called with correct parameters
      expect(jwt.sign).toHaveBeenCalledWith(
        { user: { id: user._id.toString() } },
        config.jwt.secret,
        { expiresIn: "1h" }
      );
    });

    it("should return error for non-existent user", async () => {
      const mockRequest = {
        body: {
          email: "nonexistent@example.com",
          password: "password123",
        },
      } as Request;
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;
      const mockNext = jest.fn() as NextFunction;

      await login(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invalid credentials",
        })
      );
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it("should return error for incorrect password", async () => {
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

      const mockRequest = {
        body: {
          email: "test@example.com",
          password: "wrongpassword",
        },
      } as Request;
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;
      const mockNext = jest.fn() as NextFunction;

      await login(mockRequest, mockResponse, mockNext);

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
    it("should return user data for authenticated user", async () => {
      // Create a test user
      const user = await User.create({
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        password: "hashedPassword",
      });

      const mockRequest = {
        user: { id: user._id.toString() },
      } as CustomRequest;
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;
      const mockNext = jest.fn() as NextFunction;

      await getLoggedInUser(mockRequest, mockResponse, mockNext);

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
      // Verify password is not included
      const responseData = (mockResponse.json as jest.Mock).mock.calls[0][0].data.user;
      expect(responseData.password).toBeUndefined();
    });

    it("should return error when user is not authenticated", async () => {
      const mockRequest = {
        user: null,
      } as unknown as CustomRequest;
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;
      const mockNext = jest.fn() as NextFunction;

      await getLoggedInUser(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Not authenticated",
        })
      );
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it("should return error when user ID is invalid", async () => {
      const mockRequest = {
        user: { id: new mongoose.Types.ObjectId().toString() },
      } as CustomRequest;
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;
      const mockNext = jest.fn() as NextFunction;

      await getLoggedInUser(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "User not found",
        })
      );
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });
});