import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import config from "../config";
import { NotFoundError, UnauthorizedError } from "../errors";
import { successResponse } from "../helpers";
import { User } from "../model/User";
import { CustomRequest } from "../utils/interfaces";
import logger from "../utils/logger";

export const getLoggedInUser = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      return next(new UnauthorizedError("Not authenticated"));
    }

    // Check user in the database
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return next(new NotFoundError("User not found"));
    }

    // Remove sensitive data
    const userResponse = user.toObject();

    res.status(200).json(successResponse("User found", { user: userResponse }));
  } catch (err) {
    logger.error("Get logged in user error:", err);
    next(new NotFoundError(err instanceof Error ? err.message : String(err)));
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return next(new UnauthorizedError("Invalid credentials"));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new UnauthorizedError("Invalid credentials"));
    }

    const token = jwt.sign(
      { user: { id: user._id } },
      config.jwt.secret as string,
      { expiresIn: "1h" }
    );

    res.status(200).json(successResponse("Login successful", { token }));
  } catch (err) {
    logger.error(err);
    next(new NotFoundError(err instanceof Error ? err.message : String(err)));
  }
};
