"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationEvent = void 0;
const node_events_1 = require("node:events");
const push_service_1 = require("../firebase/push.service");
const notification_model_1 = require("../../DB/Models/notification.model");
exports.notificationEvent = new node_events_1.EventEmitter();
const fullName = (user) => {
    return `${user.firstName} ${user.lastName}`.trim();
};
exports.notificationEvent.on("friendRequest", async (data) => {
    await (0, push_service_1.sendNotification)({
        userId: data.to,
        senderId: data.sender._id,
        type: notification_model_1.NotificationTypeEnum.FRIEND_REQUEST,
        title: "New Friend Request",
        body: `${fullName(data.sender)}send you a friend request}`,
        requestId: data.requestId,
    });
});
exports.notificationEvent.on("friendRequestAccepted", async (data) => {
    console.log("friendRequestAccepted event received:", data);
    await (0, push_service_1.sendNotification)({
        userId: data.to,
        senderId: data.sender._id,
        type: notification_model_1.NotificationTypeEnum.FRIEND_ACCEPTED,
        title: "New Friend Accepted",
        body: `${fullName(data.sender)}Accepted your friend request}`,
    });
});
exports.notificationEvent.on("postLike", async (data) => {
    await (0, push_service_1.sendNotification)({
        userId: data.to,
        senderId: data.sender._id,
        postId: data.postId,
        type: notification_model_1.NotificationTypeEnum.POST_LIKE,
        title: "New like",
        body: `${fullName(data.sender)} liked your post}`,
    });
});
exports.notificationEvent.on("postComment", async (data) => {
    await (0, push_service_1.sendNotification)({
        userId: data.to,
        senderId: data.sender._id,
        postId: data.postId,
        type: notification_model_1.NotificationTypeEnum.POST_COMMENT,
        title: "New Comment",
        body: `${fullName(data.sender)} Commented :${data.content}`,
        commentId: data.commentId,
    });
});
exports.notificationEvent.on("commentReply", async (data) => {
    await (0, push_service_1.sendNotification)({
        userId: data.to,
        senderId: data.sender._id,
        postId: data.postId,
        type: notification_model_1.NotificationTypeEnum.COMMENT_REPLY,
        title: "New Reply",
        body: `${fullName(data.sender)} Replied :${data.content}`,
        commentId: data.commentId,
    });
});
