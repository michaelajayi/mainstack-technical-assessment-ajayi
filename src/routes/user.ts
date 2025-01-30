import { Router } from "express";
import { getAllUsers, register } from "../controllers/userController";

const userRouter = Router();

// get all users
userRouter.get("/", getAllUsers);

// Register a user
userRouter.post("/register", register);

export default userRouter;
