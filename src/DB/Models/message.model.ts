import { HydratedDocument, model, Model } from "mongoose";
import { Schema, Types } from "mongoose";
export interface IMessage {
  _id: Types.ObjectId;
  conversationId: Types.ObjectId;
  content: string;

  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;

  readAt: Date;

  createdAt: Date;
  updatedAt?: Date;
}

export const messageSchema = new Schema<IMessage>(
  {
    content: {
      type: String,
      minLength: 1,
      maxLength: 500000,
      trim: true,
      required: true,
    },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    readAt: { type: Date },
  },
  {
    timestamps: true,
  },
);
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, readAt: -1 });

messageSchema.pre("validate", async function () {
  if (this.content) this.content = this.content.trim();
});

export const MessageModel: Model<IMessage> = model<IMessage>(
  "Message",
  messageSchema,
);

export type HMessageDocuments = HydratedDocument<IMessage>;
