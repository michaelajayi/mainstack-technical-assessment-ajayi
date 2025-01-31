"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = require("../../model/User");
const userController_1 = require("../../controllers/userController");
// Mock the logger
jest.mock("../../utils/logger", () => ({
    error: jest.fn(),
    info: jest.fn(),
}));
describe("User Controller", () => {
    describe("getAllUsers", () => {
        it("should return empty array when no users exist", () => __awaiter(void 0, void 0, void 0, function* () {
            const mockRequest = {};
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
            const mockNext = jest.fn();
            yield (0, userController_1.getAllUsers)(mockRequest, mockResponse, mockNext);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: "success",
                message: "No users found",
                data: [],
            });
        }));
        it("should return all users when users exist", () => __awaiter(void 0, void 0, void 0, function* () {
            const testUser = yield User_1.User.create({
                firstName: "Test",
                lastName: "User",
                email: "test@example.com",
                password: "hashedPassword",
            });
            const mockRequest = {};
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
            const mockNext = jest.fn();
            yield (0, userController_1.getAllUsers)(mockRequest, mockResponse, mockNext);
            const response = mockResponse.json.mock.calls[0][0];
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
        }));
    });
    describe("getSingleUser", () => {
        it("should return 404 when user ID is not provided", () => __awaiter(void 0, void 0, void 0, function* () {
            const mockRequest = {
                params: {},
            };
            const mockResponse = {};
            const mockNext = jest.fn();
            yield (0, userController_1.getSingleUser)(mockRequest, mockResponse, mockNext);
            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
                message: "User ID not provided",
            }));
        }));
        it("should return user when valid ID is provided", () => __awaiter(void 0, void 0, void 0, function* () {
            const testUser = yield User_1.User.create({
                firstName: "Test",
                lastName: "User",
                email: "test@example.com",
                password: "hashedPassword",
            });
            const mockRequest = {
                params: { id: testUser._id.toString() },
            };
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
            const mockNext = jest.fn();
            yield (0, userController_1.getSingleUser)(mockRequest, mockResponse, mockNext);
            const response = mockResponse.json.mock.calls[0][0];
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(response.status).toBe("success");
            expect(response.message).toBe("User retrieved successfully");
            expect(response.data).toMatchObject({
                firstName: "Test",
                lastName: "User",
                email: "test@example.com",
            });
            expect(response.data.password).toBeUndefined();
        }));
    });
    describe("register", () => {
        it("should create a new user successfully", () => __awaiter(void 0, void 0, void 0, function* () {
            const mockRequest = {
                body: {
                    firstName: "Test",
                    lastName: "User",
                    email: "test@example.com",
                    password: "password123",
                },
            };
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
            const mockNext = jest.fn();
            yield (0, userController_1.register)(mockRequest, mockResponse, mockNext);
            const response = mockResponse.json.mock.calls[0][0];
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
        }));
        it("should return conflict error when email already exists", () => __awaiter(void 0, void 0, void 0, function* () {
            yield User_1.User.create({
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
            };
            const mockResponse = {};
            const mockNext = jest.fn();
            yield (0, userController_1.register)(mockRequest, mockResponse, mockNext);
            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
                message: "User with this email already exists",
            }));
        }));
    });
});
