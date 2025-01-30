import { Router } from "express";
import { login } from "../controllers/authController";
import validateResource from "../middlewares/validateResources";
import { LoginSchema } from "../validation/login.schema";

const authRouter = Router();

// Login a user
authRouter.post("/login", validateResource(LoginSchema), login);

export default authRouter;
