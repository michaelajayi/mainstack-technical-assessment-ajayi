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
exports.login = exports.getLoggedInUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
const errors_1 = require("../errors");
const helpers_1 = require("../helpers");
const User_1 = require("../model/User");
const logger_1 = __importDefault(require("../utils/logger"));
const getLoggedInUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user || !req.user.id) {
            return next(new errors_1.UnauthorizedError("Not authenticated"));
        }
        // Check user in the database
        const user = yield User_1.User.findById(req.user.id).select("-password");
        if (!user) {
            return next(new errors_1.NotFoundError("User not found"));
        }
        // Remove sensitive data
        const userResponse = user.toObject();
        res.status(200).json((0, helpers_1.successResponse)("User retrieved successfully", { user: userResponse }));
    }
    catch (err) {
        logger_1.default.error("Get logged in user error:", err);
        next(new errors_1.NotFoundError(err instanceof Error ? err.message : String(err)));
    }
});
exports.getLoggedInUser = getLoggedInUser;
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield User_1.User.findOne({ email });
        if (!user) {
            return next(new errors_1.UnauthorizedError("Invalid credentials"));
        }
        const isMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            return next(new errors_1.UnauthorizedError("Invalid credentials"));
        }
        const token = jsonwebtoken_1.default.sign({ user: { id: user._id } }, config_1.default.jwt.secret, { expiresIn: "1h" });
        res.status(200).json((0, helpers_1.successResponse)("Login successful", { token }));
    }
    catch (err) {
        logger_1.default.error(err);
        next(new errors_1.NotFoundError(err instanceof Error ? err.message : String(err)));
    }
});
exports.login = login;
