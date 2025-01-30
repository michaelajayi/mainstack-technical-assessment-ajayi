import {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
  Router,
} from "express";

import { AppError } from "../errors";
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
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  }

  // Handle unknown errors
    logger.error("Unhandled error:", err);
    return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    })
};
