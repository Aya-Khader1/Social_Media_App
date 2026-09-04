import { z } from "zod";

export const sendMessageSchema = z.object({
  to: z.string().regex(/^[0-9a-fA-F]{24}$/, { error: "Invalid id Format" }),
  content: z
    .string({ error: "Message content is requried" })
    .trim()
    .min(1)
    .max(50000),
});

export const typingSchema = z.object({
  to: z.string().regex(/^[0-9a-fA-F]{24}$/, { error: "Invalid id Format" }),
});
export const markAsReadSchema = z.object({
  from: z.string().regex(/^[0-9a-fA-F]{24}$/, { error: "Invalid id Format" }),
});
export const emptySchema = z.unknown();

export const conversationSchema = {
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  }),
};

export const getMessageSchema = {
  params: z.object({
    userId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, { error: "Invalid id Format" }),
  }),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  }),
};
