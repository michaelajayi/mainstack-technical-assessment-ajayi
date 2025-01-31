import { TypeOf, object, string, z } from "zod";

const payload = {
  body: object({
    firstName: string({
      required_error: "First name is required",
    }).min(2, "First name must be at least 2 characters long"),
    lastName: string({
      required_error: "Last name is required",
    }),
    email: string({
      required_error: "Email is required",
    }).email({ message: "Invalid email" }),
    password: string({
      required_error: "Password is required",
    })
      .min(6, "Password must be at least 6 characters long")
      // .regex(
      //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
      //   "Password must contain at least one uppercase character, one lowercase character, one number and one special character"
      // ),
  }),
};

export const RegisterSchema = object({
    ...payload,
});

export type RegisterInput = TypeOf<typeof RegisterSchema>;