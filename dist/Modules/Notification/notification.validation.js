"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationParamSchema = exports.listNotificationSchema = exports.deviceTokenSchema = void 0;
const zod_1 = require("zod");
exports.deviceTokenSchema = {
    body: zod_1.z.strictObject({
        token: zod_1.z
            .string({
            error: "Device Token is required",
        })
            .min(50, { error: "Invalid device token" })
            .max(4096),
    }),
};
exports.listNotificationSchema = {
    query: zod_1.z.strictObject({
        page: zod_1.z.coerce.number().int().min(1).default(1),
        limit: zod_1.z.coerce.number().int().min(1).max(50).default(20),
        unreadOnly: zod_1.z
            .enum(["true", "false"])
            .default("false")
            .transform((value) => value === "true"),
    }),
};
exports.notificationParamSchema = {
    params: zod_1.z.strictObject({
        notificationId: zod_1.z
            .string()
            .regex(/^[0-9a-fA-F]{24}$/, { error: "Invalid id formatt" }),
    }),
};
