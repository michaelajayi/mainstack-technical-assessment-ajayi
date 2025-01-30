import { Router } from "express";
import {
  getAllUsers,
  getSingleUser,
  register,
} from "../controllers/userController";
import validateResource from "../middlewares/validateResources";
import { RegisterSchema } from "../validation/user.schema";

const userRouter = Router();


// get all users
userRouter.get("/", getAllUsers);

// get single user
userRouter.get("/:id", getSingleUser);

// register a user
userRouter.post("/register", validateResource(RegisterSchema), register);


export default userRouter;
