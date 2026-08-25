import { z } from "zod";
import {
  createPostSchema,
  postIdParamsSchema,
  updatePostSchema,
  createCommentSchema,
  CommentIdParamsSchema,
  updateCommentSchema,
} from "./post.validation";
export type ICreatePostDTO = z.infer<typeof createPostSchema.body>;
export type IPostIdParamsDTO = z.infer<typeof postIdParamsSchema.params>;
export type IUpdatePostDTO = z.infer<typeof updatePostSchema.body>;
export type ICreateCommentDTO = z.infer<typeof createCommentSchema.body>;
export type ICommentIdParamsDTO = z.infer<typeof CommentIdParamsSchema.params>;
export type IUpdateCommentDTO = z.infer<typeof updateCommentSchema.body>;
