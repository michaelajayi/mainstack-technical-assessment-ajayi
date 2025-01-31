import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { User } from "../../model/User";
import {
  getAllUsers,
  getSingleUser,
  register,
} from "../../controllers/userController";

// Mock the logger
jest.mock("../../utils/logger", () => ({
  error: jest.fn(),
  info: jest.fn(),
}));

describe("User Controller", () => {
  describe("getAllUsers", () => {
    it("should return empty array when no users exist", async () => {
      const mockRequest = {} as Request;
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;
      const mockNext = jest.fn() as NextFunction;

      await getAllUsers(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "success",
        message: "No users found",
        data: [],
      });
    });

    it("should return all users when users exist", async () => {
      const testUser = await User.create({
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        password: "hashedPassword",
      });

      const mockRequest = {} as Request;
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;
      const mockNext = jest.fn() as NextFunction;

      await getAllUsers(mockRequest, mockResponse, mockNext);

      const response = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(response.status).toBe("success");
      expect(response.message).toBe("Users retrieved successfully");
      expect(response.data).toBeInstanceOf(Array);
      expect(response.data[0]).toMatchObject({
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
      });
      expect(response.data[0].password).toBeUndefined();
    });
  });

  describe("getSingleUser", () => {
    it("should return 404 when user ID is not provided", async () => {
      const mockRequest = {
        params: {},
      } as unknown as Request;
      const mockResponse = {} as Response;
      const mockNext = jest.fn() as NextFunction;

      await getSingleUser(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "User ID not provided",
        })
      );
    });

    it("should return user when valid ID is provided", async () => {
      const testUser = await User.create({
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        password: "hashedPassword",
      });

      const mockRequest = {
        params: { id: testUser._id.toString() },
      } as unknown as Request;
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;
      const mockNext = jest.fn() as NextFunction;

      await getSingleUser(mockRequest, mockResponse, mockNext);

      const response = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(response.status).toBe("success");
      expect(response.message).toBe("User retrieved successfully");
      expect(response.data).toMatchObject({
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
      });
      expect(response.data.password).toBeUndefined();
    });
  });

  describe("register", () => {
    it("should create a new user successfully", async () => {
      const mockRequest = {
        body: {
          firstName: "Test",
          lastName: "User",
          email: "test@example.com",
          password: "password123",
        },
      } as Request;
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;
      const mockNext = jest.fn() as NextFunction;

      await register(mockRequest, mockResponse, mockNext);

      const response = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(response.status).toBe("success");
      expect(response.message).toBe("User created");
      expect(response.data).toMatchObject({
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
      });
      // Ensure the password is hashed and not returned in plain text
      expect(response.data.password).not.toBe("password123");
    });

    it("should return conflict error when email already exists", async () => {
      await User.create({
        firstName: "Existing",
        lastName: "User",
        email: "test@example.com",
        password: "hashedPassword",
      });

      const mockRequest = {
        body: {
          firstName: "Test",
          lastName: "User",
          email: "test@example.com",
          password: "password123",
        },
      } as Request;
      const mockResponse = {} as Response;
      const mockNext = jest.fn() as NextFunction;

      await register(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "User with this email already exists",
        })
      );
    });
  });
});
