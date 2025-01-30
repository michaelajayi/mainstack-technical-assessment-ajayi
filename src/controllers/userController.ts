import { NextFunction, Request, Response } from "express";
import { NotFoundError } from "../errors";
import { successResponse } from "../helpers";
import { User } from "../model/User";

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
