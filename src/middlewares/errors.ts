import {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
  Router,
} from "express";

import { AppError, ValidationError } from "../errors";
import logger from "../utils/logger";

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  next(new AppError(`Path  ${req.originalUrl} not found`, 404));
};

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof AppError) {
    // Parse the validation error message if it's a ValidationError
    let message = err.message;
    if (err instanceof ValidationError) {
      try {
        message = JSON.parse(err.message);
      } catch (err) {
        // If parsing fails, use the message as is
      }
    }
    return res.status(err.statusCode).json({
      status: "error",
      message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  }

  // Handle unknown errors
  logger.error("Unhandled error:", err);
  return res.status(500).json({
    status: "error",
    message: "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
