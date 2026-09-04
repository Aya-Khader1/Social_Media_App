import { Types } from "mongoose";
import {
  NotificationModel,
  NotificationTypeEnum,
} from "../../DB/Models/notification.model";
import { UserModel } from "../../DB/Models/user.model";
import { getMessaging } from "./firebase.config";
export interface INotificationPayload {
  userId: Types.ObjectId;
  senderId: Types.ObjectId;

  postId?: Types.ObjectId;
  commentId?: Types.ObjectId;
  requestId?: Types.ObjectId;

  type: NotificationTypeEnum;
  title: string;
  body: string;
}
const buildData = (payload: INotificationPayload): Record<string, string> => {
  const data: Record<string, string> = {
    type: payload.type,
    senderId: payload.senderId.toString(),
  };
  if (payload.postId) data.postId = payload.postId.toString();
  if (payload.commentId) data.commentId = payload.commentId.toString();
  if (payload.requestId) data.requestId = payload.requestId.toString();
  return data;
};
export const sendNotification = async (
  payload: INotificationPayload,
): Promise<void> => {
  try {
    if (payload.userId.equals(payload.senderId)) return;
    const recipient = await UserModel.findById(payload.userId).select(
      "deviceTokens notificationEnabled blockedUser",
    );
    if (!recipient) return;
    if (recipient.blockedUser?.some((id) => id.equals(payload.senderId)))
      return;
    await NotificationModel.create({
      userId: payload.userId,
      senderId: payload.senderId,
      type: payload.type,
      title: payload.title,

      body: payload.body,
      ...(payload.postId && { postId: payload.postId }),
      ...(payload.commentId && { commentId: payload.commentId }),
      ...(payload.requestId && { requestId: payload.requestId }),
    });

    if (recipient.notificationEnabled === false) {
      console.log("[Push] skipped - user has notification disabled");
      return;
    }
    const tokens = recipient.deviceTokens ?? [];
    if (!tokens.length) {
      console.log("[Push] skipped - user has no registerd devices");
      return;
    }

    const messaging = getMessaging();
    if (!messaging) {
      console.log("[Push] skipped - Firebase is not intialized");
      return;
    }
    const response = await messaging.sendEachForMulticast({
      tokens,
      notification: { title: payload.title, body: payload.body },
      data: buildData(payload),
    });
    console.log(
      `[Push] success:${response.successCount} ,failure:${response.failureCount}`,
    );
  } catch (error) {
    console.log("[Push] faild to send notification ", error);
  }
};

export const sendNotificationMany = async (
  userIds: Types.ObjectId[],
  payload: Omit<INotificationPayload, "userId">,
): Promise<void> => {
  await Promise.all(
    userIds.map((userId) => sendNotification({ ...payload, userId })),
  );
};
