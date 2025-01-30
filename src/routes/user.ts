import { Router } from "express";
import { getAllUsers, register } from "../controllers/userController";
import validateResource from "../middlewares/validateResources";
import { RegisterSchema } from "../validation/user.schema";

const userRouter = Router();

// get all users
userRouter.get("/", getAllUsers);

// Register a user
userRouter.post("/register", validateResource(RegisterSchema), register);

export default userRouter;
