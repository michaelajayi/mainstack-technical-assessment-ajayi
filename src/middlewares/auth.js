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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
const errors_1 = require("../errors");
const logger_1 = __importDefault(require("../utils/logger"));
const auth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get token from header
        const authorization = req.header("authorization");
        if (!authorization) {
            return next(new errors_1.UnauthorizedError("No authorization header found"));
        }
        // Check if it's a Bearer token
        if (!authorization.startsWith("Bearer ")) {
            return next(new errors_1.UnauthorizedError("Invalid token format"));
        }
        const token = authorization.split(" ")[1];
        if (!token) {
            return next(new errors_1.UnauthorizedError("No token found"));
        }
        try {
            // Verify token
            const decoded = jsonwebtoken_1.default.verify(token, config_1.default.jwt.secret);
            if (!decoded.user || !decoded.user.id) {
                return next(new errors_1.UnauthorizedError("Invalid token payload"));
            }
            // Set user in request
            req.user = {
                id: decoded.user.id,
            };
            next();
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                return next(new errors_1.UnauthorizedError("Invalid token"));
            }
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                return next(new errors_1.UnauthorizedError("Token has expired"));
            }
            throw error;
        }
    }
    catch (err) {
        logger_1.default.error("Auth middleware error:", err);
        next(new errors_1.UnauthorizedError("Authentication failed"));
    }
});
exports.default = auth;
