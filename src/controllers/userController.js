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
exports.register = exports.getSingleUser = exports.getAllUsers = void 0;
const errors_1 = require("../errors");
const helpers_1 = require("../helpers");
const User_1 = require("../model/User");
const logger_1 = __importDefault(require("../utils/logger"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const getAllUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield User_1.User.find().select("-password");
        res.status(200).json((0, helpers_1.successResponse)(users.length ? 'Users retrieved successfully' : 'No users found', users));
    }
    catch (err) {
        logger_1.default.error('Get all users error: ', err);
        next(new errors_1.NotFoundError(err instanceof Error ? err.message : String(err)));
    }
});
exports.getAllUsers = getAllUsers;
const getSingleUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.id;
        if (!userId) {
            return next(new errors_1.NotFoundError("User ID not provided"));
        }
        const user = yield User_1.User.findById(userId).select("-password");
        if (!user) {
            return next(new errors_1.NotFoundError("User not found"));
        }
        res.status(200).json((0, helpers_1.successResponse)("User retrieved successfully", user));
    }
    catch (err) {
        logger_1.default.error(err);
        next(new errors_1.NotFoundError(err instanceof Error ? err.message : String(err)));
    }
});
exports.getSingleUser = getSingleUser;
const register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { firstName, lastName, email, password } = req.body;
        // check if user with email already exists
        let existingUser = yield User_1.User.findOne({
            email,
        });
        if (existingUser) {
            return next(new errors_1.ConflictError("User with this email already exists"));
        }
        const salt = yield bcrypt_1.default.genSalt(10);
        password = yield bcrypt_1.default.hash(password, salt);
        let user = new User_1.User({
            firstName,
            lastName,
            email,
            password,
        });
        user = yield user.save();
        res.status(201).json((0, helpers_1.successResponse)("User created", user));
    }
    catch (err) {
        logger_1.default.error(err);
        return next(new errors_1.NotFoundError(err instanceof Error ? err.message : String(err)));
    }
});
exports.register = register;
