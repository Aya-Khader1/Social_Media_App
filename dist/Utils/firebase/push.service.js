"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotificationMany = exports.sendNotification = void 0;
const notification_model_1 = require("../../DB/Models/notification.model");
const user_model_1 = require("../../DB/Models/user.model");
const firebase_config_1 = require("./firebase.config");
const buildData = (payload) => {
    const data = {
        type: payload.type,
        senderId: payload.senderId.toString(),
    };
    if (payload.postId)
        data.postId = payload.postId.toString();
    if (payload.commentId)
        data.commentId = payload.commentId.toString();
    if (payload.requestId)
        data.requestId = payload.requestId.toString();
    return data;
};
const sendNotification = async (payload) => {
    try {
        if (payload.userId.equals(payload.senderId))
            return;
        const recipient = await user_model_1.UserModel.findById(payload.userId).select("deviceTokens notificationEnabled blockedUser");
        if (!recipient)
            return;
        if (recipient.blockedUser?.some((id) => id.equals(payload.senderId)))
            return;
        await notification_model_1.NotificationModel.create({
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
        const messaging = (0, firebase_config_1.getMessaging)();
        if (!messaging) {
            console.log("[Push] skipped - Firebase is not intialized");
            return;
        }
        const response = await messaging.sendEachForMulticast({
            tokens,
            notification: { title: payload.title, body: payload.body },
            data: buildData(payload),
        });
        console.log(`[Push] success:${response.successCount} ,failure:${response.failureCount}`);
    }
    catch (error) {
        console.log("[Push] faild to send notification ", error);
    }
};
exports.sendNotification = sendNotification;
const sendNotificationMany = async (userIds, payload) => {
    await Promise.all(userIds.map((userId) => (0, exports.sendNotification)({ ...payload, userId })));
};
exports.sendNotificationMany = sendNotificationMany;
