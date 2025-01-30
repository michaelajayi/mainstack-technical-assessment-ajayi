import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import config from "../config";
import { UnauthorizedError } from "../errors";
import { CustomRequest } from "../utils/interfaces";
import logger from "../utils/logger";

const auth = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const authorization = req.header("authorization");
    if (!authorization) {
      return next(new UnauthorizedError("No authorization header found"));
    }

    // Check if it's a Bearer token
    if (!authorization.startsWith("Bearer ")) {
      return next(new UnauthorizedError("Invalid token format"));
    }

    const token = authorization.split(" ")[1];
    if (!token) {
      return next(new UnauthorizedError("No token found"));
    }

    try {
      // Verify token
      const decoded = jwt.verify(
        token,
        config.jwt.secret as string
      ) as jwt.JwtPayload;

      if (!decoded.user || !decoded.user.id) {
        return next(new UnauthorizedError("Invalid token payload"));
      }

      // Set user in request
      req.user = {
        id: decoded.user.id,
      };

      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return next(new UnauthorizedError("Invalid token"));
      }
      if (error instanceof jwt.TokenExpiredError) {
        return next(new UnauthorizedError("Token has expired"));
      }
      throw error;
    }
  } catch (err) {
    logger.error("Auth middleware error:", err);
    next(new UnauthorizedError("Authentication failed"));
  }
};

export default auth;