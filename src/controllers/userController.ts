import { NextFunction, Request, Response } from "express";
import { NotFoundError } from "../errors";
import { successResponse } from "../helpers";
import { User } from "../model/User";
import logger from "../utils/logger";
import bcrypt from "bcrypt";

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const users = await User.find();

    if (!users) {
      throw new NotFoundError("No users found");
    }

    res.status(200).json(successResponse("All users", users));
  } catch (err) {
    throw new NotFoundError(err instanceof Error ? err.message : String(err));
  }
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let { firstName, lastName, email, password } = req.body;

    // check if user with email already exists
    let existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      throw new Error("User with this email already exists");
    }
      
      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);

    let user = new User({
      firstName,
      lastName,
      email,
      password,
    });

    user = await user.save();

    res.status(201).json(successResponse("User created", user));
  } catch (err) {
    logger.error(err);
    throw new NotFoundError(err instanceof Error ? err.message : String(err));
  }
};
