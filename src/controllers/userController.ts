import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import { ConflictError, NotFoundError } from "../errors";
import { successResponse } from "../helpers";
import { User } from "../model/User";
import logger from "../utils/logger";

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json(successResponse(users.length ? 'Users retried successfully' : 'No users found', users))
  } catch (err) {
    logger.error('Get all users error: ', err);
    next(new NotFoundError(err instanceof Error ? err.message : String(err)));
  }
};

export const getSingleUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return next(new NotFoundError("User ID not provided"));
    }
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return next(new NotFoundError("User not found"));
    }

    res.status(200).json(successResponse("User retrieved successfully", user));
  } catch (err) {
    logger.error(err);
    next(new NotFoundError(err instanceof Error ? err.message : String(err)));
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
      return next(new ConflictError("User with this email already exists"));
    }

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
    return next(
      new NotFoundError(err instanceof Error ? err.message : String(err))
    );
  }
};
