"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const validateResources_1 = __importDefault(require("../middlewares/validateResources"));
const user_schema_1 = require("../validation/user.schema");
const userRouter = (0, express_1.Router)();
// get all users
userRouter.get("/", userController_1.getAllUsers);
// get single user
userRouter.get("/:id", userController_1.getSingleUser);
// register a user
userRouter.post("/register", (0, validateResources_1.default)(user_schema_1.RegisterSchema), userController_1.register);
exports.default = userRouter;
