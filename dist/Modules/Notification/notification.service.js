"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = require("../../DB/Models/user.model");
const notification_model_1 = require("../../DB/Models/notification.model");
const error_response_1 = require("../../Utils/response/error.response");
class Notification {
    deviceToken = async (req, res) => {
        const { token } = req.body;
        await user_model_1.UserModel.updateOne({ _id: req.user._id }, { $addToSet: { deviceTokens: token } });
        return res.status(200).json({ message: "Device Registered Successfully" });
    };
    removeDeviceToken = async (req, res) => {
        const { token } = req.body;
        await user_model_1.UserModel.updateOne({ _id: req.user._id }, { $pull: { deviceTokens: token } });
        return res.status(200).json({ message: "Device Removed Successfully" });
    };
    listAllNotification = async (req, res) => {
        const { page, limit, unreadOnly } = req.query;
        const skip = (page - 1) * limit;
        const filter = {
            userId: req.user._id,
            ...(unreadOnly && { readAt: { $exists: false } }),
        };
        const [notification, total, unread] = await Promise.all([
            await notification_model_1.NotificationModel.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            notification_model_1.NotificationModel.countDocuments(filter),
            notification_model_1.NotificationModel.countDocuments({
                userId: req.user._id,
                readAt: { $exists: false },
            }),
        ]);
        return res.status(200).json({
            message: "Done",
            data: {
                notification,
                unread,
                pagination: { page, limit, total, pages: Math.ceil(total / limit) },
            },
        });
    };
    unreadCount = async (req, res) => {
        const unread = await notification_model_1.NotificationModel.countDocuments({
            userId: req.user._id,
            readAt: { $exists: false },
        });
        return res.status(200).json({
            message: "Done",
            data: { unread },
        });
    };
    markAsRead = async (req, res) => {
        const { notificationId } = req.params;
        const notification = await notification_model_1.NotificationModel.findByIdAndUpdate({
            _id: notificationId,
            userId: req.user._id,
        }, { readAt: Date.now() }, { new: true });
        if (!notification)
            throw new error_response_1.NotFoundException("Notification not found");
        return res.status(200).json({
            message: "Done",
            data: notification,
        });
    };
    markAllAsRead = async (req, res) => {
        await notification_model_1.NotificationModel.updateMany({
            userId: req.user._id,
            readAt: { $exists: false },
        }, { readAt: Date.now() });
        return res.status(200).json({
            message: "All Notifications mark as read",
        });
    };
    deleteNotification = async (req, res) => {
        const { notificationId } = req.params;
        const deleted = await notification_model_1.NotificationModel.findOneAndDelete({
            _id: notificationId,
            userId: req.user._id,
        });
        if (!deleted)
            throw new error_response_1.NotFoundException("Notification not found");
        return res.status(200).json({
            message: "Notification Deleted",
        });
    };
    clearAll = async (req, res) => {
        const deleted = await notification_model_1.NotificationModel.deleteMany({
            userId: req.user._id,
        });
        if (!deleted)
            throw new error_response_1.NotFoundException("Notification not found");
        return res.status(200).json({
            message: "All Notifications deleted",
        });
    };
}
exports.default = new Notification();
