"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = __importDefault(require("../middlewares/auth"));
const validateResources_1 = __importDefault(require("../middlewares/validateResources"));
const login_schema_1 = require("../validation/login.schema");
const authRouter = (0, express_1.Router)();
// Login a user
authRouter.post("/login", (0, validateResources_1.default)(login_schema_1.LoginSchema), authController_1.login);
// get logged in user
authRouter.get("/me", auth_1.default, authController_1.getLoggedInUser);
exports.default = authRouter;
