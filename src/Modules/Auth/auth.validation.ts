import { z } from "zod";
export const loginSchema = {
  body: z.strictObject({
    email: z.email({ error: "Invalid email address" }),
    password: z
      .string({ error: "Password must be required" })
      .min(8, { error: "Password must be at least 8 character" })
      .max(64, { error: "Password must be at most 64 character long" }),
  }),
};
export const confirmEmailSchema = {
  body: z.strictObject({
    email: z.email({ error: "Invalid email address" }),
    otp: z.string().regex(/^\d{6}$/),
  }),
};

export const signUpSchema = {
  body: loginSchema.body
    .extend({
      username: z
        .string({ error: "Username must be required" })
        .min(2, { error: "Username must be at least 2 character" })
        .max(25, { error: "Username must be at most 25 character long" }),
      email: z.email({ error: "Invalid email address" }),
      password: z
        .string({ error: "Password must be required" })
        .min(8, { error: "Password must be at least 8 character" })
        .max(64, { error: "Password must be at most 64 character long" }),
      confirmPassword: z
        .string({ error: "confirmPassword must be required" })
        .min(8, { error: "confirmPassword must be at least 8 character" })
        .max(64, {
          error: "confirmPassword must be at most 64 character long",
        }),
    })
    .superRefine((data, ctx) => {
      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: "custom",
          path: ["confirmPassword"],
          message: "Password mismatch",
        });
      }
    }),
};
