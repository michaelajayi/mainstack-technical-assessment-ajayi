import { Router } from "express";
import { getLoggedInUser, login } from "../controllers/authController";
import auth from "../middlewares/auth";
import validateResource from "../middlewares/validateResources";
import { LoginSchema } from "../validation/login.schema";

const authRouter = Router();

// Login a user
authRouter.post("/login", validateResource(LoginSchema), login);

// get logged in user
authRouter.get("/me", auth, getLoggedInUser);

export default authRouter;
