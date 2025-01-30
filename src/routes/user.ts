import { Router } from "express";
import { getAllUsers } from "../controllers/userController";

const userRouter = Router();

// get all users
userRouter.get("/", getAllUsers);

export default userRouter;
