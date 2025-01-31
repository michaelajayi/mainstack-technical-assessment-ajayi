"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFoundHandler = void 0;
const errors_1 = require("../errors");
const logger_1 = __importDefault(require("../utils/logger"));
const config_1 = __importDefault(require("../config"));
const notFoundHandler = (req, res, next) => {
    next(new errors_1.AppError(`Path  ${req.originalUrl} not found`, 404));
};
exports.notFoundHandler = notFoundHandler;
const errorHandler = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }
    if (err instanceof errors_1.AppError) {
        // Parse the validation error message if it's a ValidationError
        let message = err.message;
        if (err instanceof errors_1.ValidationError) {
            try {
                message = JSON.parse(err.message);
            }
            catch (err) {
                // If parsing fails, use the message as is
            }
        }
        return res.status(err.statusCode).json(Object.assign({ status: "error", message }, (config_1.default.env.isDevelopment && { stack: err.stack })));
    }
    // Handle unknown errors
    logger_1.default.error("Unhandled error:", err);
    return res.status(500).json(Object.assign({ status: "error", message: "Internal server error" }, (config_1.default.env.isDevelopment && { stack: err.stack })));
};
exports.errorHandler = errorHandler;
