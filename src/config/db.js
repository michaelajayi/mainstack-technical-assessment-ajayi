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
const _1 = __importDefault(require("."));
const logger_1 = __importDefault(require("../utils/logger")); // Import your logger
const mongo_uri = _1.default.mongo.uri;
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!mongo_uri) {
            throw new Error("MONGO_URI is not defined in .env");
        }
        yield mongoose_1.default.connect(mongo_uri, {
            // directConnection: true,
        });
        logger_1.default.info("MongoDB Connected...");
    }
    catch (error) {
        logger_1.default.error("Error connecting to MongoDB:", error);
        throw error;
    }
});
exports.default = connectDB;
