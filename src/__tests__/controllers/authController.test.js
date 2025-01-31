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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = require("../../model/User");
const authController_1 = require("../../controllers/authController");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../../config"));
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
    let mockRequest;
    let mockResponse;
    let mockNext;
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
        test("should login successfully with correct credentials", () => __awaiter(void 0, void 0, void 0, function* () {
            // Create a test user
            const hashedPassword = yield bcrypt_1.default.hash("password123", 10);
            const user = yield User_1.User.create({
                firstName: "Test",
                lastName: "User",
                email: "test@example.com",
                password: hashedPassword,
            });
            // Mock bcrypt.compare to return true
            bcrypt_1.default.compare.mockResolvedValue(true);
            // Mock jwt.sign to return a token
            const mockToken = "mock-jwt-token";
            jsonwebtoken_1.default.sign.mockImplementation((payload, secret, options) => {
                // Verify the payload structure without strict type checking
                expect(payload).toHaveProperty("user");
                expect(payload.user).toHaveProperty("id");
                // Verify that the ID is either a string or an ObjectId
                expect(typeof payload.user.id === "string" ||
                    payload.user.id instanceof mongoose_1.default.Types.ObjectId).toBeTruthy();
                expect(secret).toBe(config_1.default.jwt.secret);
                expect(options).toEqual({ expiresIn: "1h" });
                return mockToken;
            });
            mockRequest.body = {
                email: "test@example.com",
                password: "password123",
            };
            yield (0, authController_1.login)(mockRequest, mockResponse, mockNext);
            expect(mockNext).not.toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: "success",
                message: "Login successful",
                data: { token: mockToken },
            });
            // Verify that jwt.sign was called exactly once
            expect(jsonwebtoken_1.default.sign).toHaveBeenCalledTimes(1);
        }));
        test("should return error for non-existent user", () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.body = {
                email: "nonexistent@example.com",
                password: "password123",
            };
            yield (0, authController_1.login)(mockRequest, mockResponse, mockNext);
            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
                message: "Invalid credentials",
            }));
            expect(mockResponse.status).not.toHaveBeenCalled();
            expect(mockResponse.json).not.toHaveBeenCalled();
        }));
        test("should return error for incorrect password", () => __awaiter(void 0, void 0, void 0, function* () {
            // Create a test user
            const hashedPassword = yield bcrypt_1.default.hash("password123", 10);
            yield User_1.User.create({
                firstName: "Test",
                lastName: "User",
                email: "test@example.com",
                password: hashedPassword,
            });
            // Mock bcrypt.compare to return false
            bcrypt_1.default.compare.mockResolvedValue(false);
            mockRequest.body = {
                email: "test@example.com",
                password: "wrongpassword",
            };
            yield (0, authController_1.login)(mockRequest, mockResponse, mockNext);
            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
                message: "Invalid credentials",
            }));
            expect(mockResponse.status).not.toHaveBeenCalled();
            expect(mockResponse.json).not.toHaveBeenCalled();
        }));
    });
    describe("getLoggedInUser", () => {
        test("should return user data for authenticated user", () => __awaiter(void 0, void 0, void 0, function* () {
            // Create a test user
            const user = yield User_1.User.create({
                firstName: "Test",
                lastName: "User",
                email: "test@example.com",
                password: "hashedPassword",
            });
            const customRequest = {
                user: { id: user._id.toString() },
            };
            yield (0, authController_1.getLoggedInUser)(customRequest, mockResponse, mockNext);
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
        }));
        test("should return error when user is not authenticated", () => __awaiter(void 0, void 0, void 0, function* () {
            const customRequest = {
                user: null,
            };
            yield (0, authController_1.getLoggedInUser)(customRequest, mockResponse, mockNext);
            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
                message: "Not authenticated",
            }));
        }));
        test("should return error when user ID is invalid", () => __awaiter(void 0, void 0, void 0, function* () {
            const customRequest = {
                user: { id: new mongoose_1.default.Types.ObjectId().toString() },
            };
            yield (0, authController_1.getLoggedInUser)(customRequest, mockResponse, mockNext);
            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
                message: "User not found",
            }));
        }));
    });
});
