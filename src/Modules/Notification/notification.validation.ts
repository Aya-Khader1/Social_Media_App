import { z } from "zod";

export const deviceTokenSchema = {
  body: z.strictObject({
    token: z
      .string({
        error: "Device Token is required",
      })
      .min(50, { error: "Invalid device token" })
      .max(4096),
  }),
};

export const listNotificationSchema = {
  query: z.strictObject({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
    unreadOnly: z
      .enum(["true", "false"])
      .default("false")
      .transform((value) => value === "true"),
  }),
};
export const notificationParamSchema = {
  params: z.strictObject({
    notificationId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, { error: "Invalid id formatt" }),
  }),
};
