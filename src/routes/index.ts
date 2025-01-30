import { Router } from "express";
import authRoutes from "./auth";
import userRoutes from "./user";

const v1Router = Router();

v1Router.use("/users", userRoutes);
v1Router.use("/auth", authRoutes);

export { v1Router };
