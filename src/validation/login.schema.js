"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginSchema = void 0;
const zod_1 = require("zod");
const payload = {
    body: (0, zod_1.object)({
        email: (0, zod_1.string)({
            required_error: "Email is required",
        }).email({ message: "Invalid email" }),
        password: (0, zod_1.string)({
            required_error: "Password is required",
        }),
    }),
};
exports.LoginSchema = (0, zod_1.object)(Object.assign({}, payload));
