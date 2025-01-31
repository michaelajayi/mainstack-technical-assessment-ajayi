"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.v1Router = void 0;
const express_1 = require("express");
const auth_1 = __importDefault(require("./auth"));
const user_1 = __importDefault(require("./user"));
const product_1 = __importDefault(require("./product"));
const v1Router = (0, express_1.Router)();
exports.v1Router = v1Router;
v1Router.use("/users", user_1.default);
v1Router.use("/auth", auth_1.default);
v1Router.use("/products", product_1.default);
