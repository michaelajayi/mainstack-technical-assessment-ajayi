"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterSchema = void 0;
const zod_1 = require("zod");
const payload = {
    body: (0, zod_1.object)({
        firstName: (0, zod_1.string)({
            required_error: "First name is required",
        }).min(2, "First name must be at least 2 characters long"),
        lastName: (0, zod_1.string)({
            required_error: "Last name is required",
        }),
        email: (0, zod_1.string)({
            required_error: "Email is required",
        }).email({ message: "Invalid email" }),
        password: (0, zod_1.string)({
            required_error: "Password is required",
        })
            .min(6, "Password must be at least 6 characters long")
        // .regex(
        //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
        //   "Password must contain at least one uppercase character, one lowercase character, one number and one special character"
        // ),
    }),
};
exports.RegisterSchema = (0, zod_1.object)(Object.assign({}, payload));
