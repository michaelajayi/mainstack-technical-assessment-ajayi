"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const envVarsSchema = joi_1.default
    .object({
    NODE_ENV: joi_1.default.string().default("development"),
    MONGO_URI: joi_1.default.string().required().description("MONGO_URI is required"),
    JWT_SECRET: joi_1.default.string().required().description("JWT_SECRET is required"),
    PORT: joi_1.default.number().default(8000),
})
    .unknown()
    .required();
const { value: envVars, error } = envVarsSchema.validate(process.env);
if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}
const config = {
    env: {
        isProduction: process.env.NODE_ENV === "production",
        isDevelopment: process.env.NODE_ENV === "development",
        isTest: process.env.NODE_ENV === "test",
    },
    mongo: {
        uri: envVars.MONGO_URI,
    },
    jwt: {
        secret: envVars.JWT_SECRET,
    },
    port: {
        app: envVars.PORT,
    },
};
exports.default = config;
