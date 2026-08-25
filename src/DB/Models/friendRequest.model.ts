import mongoose, {
  Types,
  Schema,
  Model,
  model,
  HydratedDocument,
} from "mongoose";
export interface IFriendRequest {
  _id: Types.ObjectId;
  sendBy: Types.ObjectId;
  sendTo: Types.ObjectId;

  createdAt: Date;
  updatedAt?: Date;
}

export const friendRequestSchema = new Schema<IFriendRequest>(
  {
    sendBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sendTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);
friendRequestSchema.index({ sendBy: 1, sendTo: 1 });
export const FriendRequestModel: Model<IFriendRequest> =
  mongoose.models.FriendRequestModel ||
  model<IFriendRequest>("Friend Request", friendRequestSchema);

export type HFriendRequestDocuments = HydratedDocument<IFriendRequest>;
