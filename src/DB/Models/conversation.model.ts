import { HydratedDocument, model, Model } from "mongoose";
import { Schema, Types } from "mongoose";
export interface IConversation {
  _id: Types.ObjectId;

  participants: Types.ObjectId[];
  lastMessage?: string;
  lastMessageAt?: Date;
  lastMessageBy?: Date;

  createdAt: Date;
  updatedAt?: Date;
}

export const conversationSchema = new Schema<IConversation>(
  {
    participants: [
      {
        type: Schema.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: { type: String },
    lastMessageAt: { type: Date },
    lastMessageBy: { type: Schema.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  },
);
conversationSchema.index({ participants: 1, createdAt: -1 });

export const ConversationModel: Model<IConversation> = model<IConversation>(
  "Conversation",
  conversationSchema,
);

export type HConversationDocuments = HydratedDocument<IConversation>;
