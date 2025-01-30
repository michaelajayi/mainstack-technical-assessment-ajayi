import { object, string, TypeOf, z } from "zod";

const payload = {
  body: object({
    email: string({
      required_error: "Email is required",
    }).email({ message: "Invalid email" }),
    password: string({
      required_error: "Password is required",
    }),
  }),
};

export const LoginSchema = object({
  ...payload,
});

export type LoginInput = TypeOf<typeof LoginSchema>;
