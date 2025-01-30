import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { NotFoundError, UnauthorizedError } from "../errors";
import { successResponse } from "../helpers";
import { User } from "../model/User";
import { CustomRequest } from "../utils/interfaces";
import logger from "../utils/logger";
import config from "../config";

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const users = await User.find();

    if (!users) {
      return next(new NotFoundError("No users found"));
    }

    res.status(200).json(successResponse("Users found", users));
  } catch (err) {
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
      { user: { id: user.id } },
      config.jwt.secret as string,
      { expiresIn: "1h" }
    );

    res.status(200).json(successResponse("Login successful", { token }));
  } catch (err) {
    logger.error(err);
    next(new NotFoundError(err instanceof Error ? err.message : String(err)));
  }
};
