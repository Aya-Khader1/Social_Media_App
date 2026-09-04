"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessageSchema = exports.conversationSchema = exports.emptySchema = exports.markAsReadSchema = exports.typingSchema = exports.sendMessageSchema = void 0;
const zod_1 = require("zod");
exports.sendMessageSchema = zod_1.z.object({
    to: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, { error: "Invalid id Format" }),
    content: zod_1.z
        .string({ error: "Message content is requried" })
        .trim()
        .min(1)
        .max(50000),
});
exports.typingSchema = zod_1.z.object({
    to: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, { error: "Invalid id Format" }),
});
exports.markAsReadSchema = zod_1.z.object({
    from: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, { error: "Invalid id Format" }),
});
exports.emptySchema = zod_1.z.unknown();
exports.conversationSchema = {
    query: zod_1.z.object({
        page: zod_1.z.coerce.number().int().min(1).default(1),
        limit: zod_1.z.coerce.number().int().min(1).max(50).default(20),
    }),
};
exports.getMessageSchema = {
    params: zod_1.z.object({
        userId: zod_1.z
            .string()
            .regex(/^[0-9a-fA-F]{24}$/, { error: "Invalid id Format" }),
    }),
    query: zod_1.z.object({
        page: zod_1.z.coerce.number().int().min(1).default(1),
        limit: zod_1.z.coerce.number().int().min(1).max(50).default(20),
    }),
};
