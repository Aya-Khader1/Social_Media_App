import { Types, Schema, Model, model, HydratedDocument } from "mongoose";

export interface IComment {
  _id: Types.ObjectId;
  content: string;
  postId: Types.ObjectId;
  parentId?: Types.ObjectId;
  createdBy: Types.ObjectId;

  createdAt: Date;
  updatedAt?: Date;
}

export const commentSchema = new Schema<IComment>(
  {
    content: {
      type: String,
      minLength: 2,
      maxLength: 500000,
      required: true,
    },
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    parentId: { type: Schema.Types.ObjectId, ref: "Comment" },
  },
  {
    timestamps: true,
  },
);
commentSchema.index({ postId: 1, createdAt: -1 });

export const CommentModel: Model<IComment> = model<IComment>(
  "Comment",
  commentSchema,
);

export type HCommentDocuments = HydratedDocument<IComment>;
