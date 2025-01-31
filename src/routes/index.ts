import { Router } from "express";
import authRoutes from "./auth";
import userRoutes from "./user";
import productRoutes from './product';

const v1Router = Router();

v1Router.use("/users", userRoutes);
v1Router.use("/auth", authRoutes);
v1Router.use("/products", productRoutes);

export { v1Router };
