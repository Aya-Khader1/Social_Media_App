"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signUpSchema = exports.confirmEmailSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = {
    body: zod_1.z.strictObject({
        email: zod_1.z.email({ error: "Invalid email address" }),
        password: zod_1.z
            .string({ error: "Password must be required" })
            .min(8, { error: "Password must be at least 8 character" })
            .max(64, { error: "Password must be at most 64 character long" }),
    }),
};
exports.confirmEmailSchema = {
    body: zod_1.z.strictObject({
        email: zod_1.z.email({ error: "Invalid email address" }),
        otp: zod_1.z.string().regex(/^\d{6}$/),
    }),
};
exports.signUpSchema = {
    body: exports.loginSchema.body
        .extend({
        username: zod_1.z
            .string({ error: "Username must be required" })
            .min(2, { error: "Username must be at least 2 character" })
            .max(25, { error: "Username must be at most 25 character long" }),
        email: zod_1.z.email({ error: "Invalid email address" }),
        password: zod_1.z
            .string({ error: "Password must be required" })
            .min(8, { error: "Password must be at least 8 character" })
            .max(64, { error: "Password must be at most 64 character long" }),
        confirmPassword: zod_1.z
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
