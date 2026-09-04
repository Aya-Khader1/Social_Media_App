import { EventEmitter } from "node:events";
import { Types } from "mongoose";
import { sendNotification } from "../firebase/push.service";
import { NotificationTypeEnum } from "../../DB/Models/notification.model";

export const notificationEvent = new EventEmitter();

interface IActor {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
}

const fullName = (user: IActor): string => {
  return `${user.firstName} ${user.lastName}`.trim();
};

notificationEvent.on(
  "friendRequest",
  async (data: {
    to: Types.ObjectId;
    sender: IActor;
    requestId: Types.ObjectId;
  }) => {
    await sendNotification({
      userId: data.to,
      senderId: data.sender._id,
      type: NotificationTypeEnum.FRIEND_REQUEST,
      title: "New Friend Request",
      body: `${fullName(data.sender)}send you a friend request}`,
      requestId: data.requestId,
    });
  },
);

notificationEvent.on(
  "friendRequestAccepted",
  async (data: { to: Types.ObjectId; sender: IActor }) => {
    console.log("friendRequestAccepted event received:", data);
    await sendNotification({
      userId: data.to,
      senderId: data.sender._id,
      type: NotificationTypeEnum.FRIEND_ACCEPTED,
      title: "New Friend Accepted",
      body: `${fullName(data.sender)}Accepted your friend request}`,
    });
  },
);
notificationEvent.on(
  "postLike",
  async (data: {
    to: Types.ObjectId;
    sender: IActor;
    postId: Types.ObjectId;
  }) => {
    await sendNotification({
      userId: data.to,
      senderId: data.sender._id,
      postId: data.postId,

      type: NotificationTypeEnum.POST_LIKE,
      title: "New like",
      body: `${fullName(data.sender)} liked your post}`,
    });
  },
);
notificationEvent.on(
  "postComment",
  async (data: {
    to: Types.ObjectId;
    sender: IActor;
    postId: Types.ObjectId;
    content: string;
    commentId: Types.ObjectId;
  }) => {
    await sendNotification({
      userId: data.to,
      senderId: data.sender._id,
      postId: data.postId,
      type: NotificationTypeEnum.POST_COMMENT,
      title: "New Comment",
      body: `${fullName(data.sender)} Commented :${data.content}`,
      commentId: data.commentId,
    });
  },
);
notificationEvent.on(
  "commentReply",
  async (data: {
    to: Types.ObjectId;
    sender: IActor;
    postId: Types.ObjectId;
    content: string;
    commentId: Types.ObjectId;
  }) => {
    await sendNotification({
      userId: data.to,
      senderId: data.sender._id,
      postId: data.postId,
      type: NotificationTypeEnum.COMMENT_REPLY,
      title: "New Reply",
      body: `${fullName(data.sender)} Replied :${data.content}`,
      commentId: data.commentId,
    });
  },
);
