"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationModel = exports.notificationSchema = exports.NotificationTypeEnum = void 0;
const mongoose_1 = require("mongoose");
var NotificationTypeEnum;
(function (NotificationTypeEnum) {
    NotificationTypeEnum["FRIEND_REQUEST"] = "FRIEND_REQUEST";
    NotificationTypeEnum["FRIEND_ACCEPTED"] = "FRIEND_ACCEPTED";
    NotificationTypeEnum["POST_LIKE"] = "POST_LIKE";
    NotificationTypeEnum["POST_COMMENT"] = "POST_COMMENT";
    NotificationTypeEnum["COMMENT_REPLY"] = "COMMENT_REPLY";
})(NotificationTypeEnum || (exports.NotificationTypeEnum = NotificationTypeEnum = {}));
exports.notificationSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    senderId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
        type: String,
        enum: Object.values(NotificationTypeEnum),
        required: true,
    },
    title: { type: String, required: true },
    postId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Post" },
    commentId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Comment" },
    requestId: { type: mongoose_1.Schema.Types.ObjectId, ref: "FriendRequest" },
    readAt: { type: Date },
}, {
    timestamps: true,
});
exports.notificationSchema.index({ userId: 1, createdAt: -1 });
exports.notificationSchema.index({ userId: 1, readAt: -1 });
exports.notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });
exports.NotificationModel = (0, mongoose_1.model)("Notification", exports.notificationSchema);
