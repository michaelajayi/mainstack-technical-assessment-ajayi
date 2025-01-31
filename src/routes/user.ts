import { Router } from "express";
import {
  getAllUsers,
  getSingleUser,
  register,
} from "../controllers/userController";
import validateResource from "../middlewares/validateResources";
import { RegisterSchema } from "../validation/user.schema";

import auth from "../middlewares/auth";

const userRouter = Router();

// get all users
userRouter.get("/", auth, getAllUsers);

// get single user
userRouter.get("/:id", auth, getSingleUser);

// register a user
userRouter.post("/register", validateResource(RegisterSchema), register);

export default userRouter;
