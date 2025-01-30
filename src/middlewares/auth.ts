import { NextFunction } from "express";
import jwt from "jsonwebtoken";
import { NotFoundError, UnauthorizedError } from "../errors";
import { CustomRequest } from "../utils/interfaces";
import logger from "../utils/logger";
import config from "../config";

const auth = async (req: CustomRequest, next: NextFunction) => {
  try {
    const authorization = req.header("authorization") || "";
    const token = authorization.split(" ")[1];
    if (!token) {
      return next(new UnauthorizedError("No token, authorization denied"));
    }

    const decoded = jwt.verify(token, config.jwt.secret as string) as jwt.JwtPayload & { user: { id: string } };

    const user = {
      id: Number(decoded.user.id),
    };

    if (!user) {
      return next(new NotFoundError("User not found"));
    }

    req.user = user;
    next();
  } catch (err) {
    logger.error(err);
    next(new NotFoundError(err instanceof Error ? err.message : String(err)));
  }
};

export default auth;
