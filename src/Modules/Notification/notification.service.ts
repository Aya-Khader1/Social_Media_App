import { Request, Response } from "express";
import {
  IDeviceTokenDTO,
  IListNotificationDTO,
  INotificationParamsDTO,
} from "./notification.dto";
import { UserModel } from "../../DB/Models/user.model";
import { NotificationModel } from "../../DB/Models/notification.model";
import { NotFoundException } from "../../Utils/response/error.response";

class Notification {
  deviceToken = async (req: Request, res: Response): Promise<Response> => {
    const { token }: IDeviceTokenDTO = req.body;
    await UserModel.updateOne(
      { _id: req.user!._id },
      { $addToSet: { deviceTokens: token } },
    );
    return res.status(200).json({ message: "Device Registered Successfully" });
  };
  removeDeviceToken = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { token }: IDeviceTokenDTO = req.body;
    await UserModel.updateOne(
      { _id: req.user!._id },
      { $pull: { deviceTokens: token } },
    );
    return res.status(200).json({ message: "Device Removed Successfully" });
  };
  listAllNotification = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { page, limit, unreadOnly }: IListNotificationDTO =
      req.query as unknown as {
        page: number;
        limit: number;
        unreadOnly: boolean;
      };
    const skip = (page - 1) * limit;
    const filter = {
      userId: req.user!._id,
      ...(unreadOnly && { readAt: { $exists: false } }),
    };

    const [notification, total, unread] = await Promise.all([
      await NotificationModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      NotificationModel.countDocuments(filter),
      NotificationModel.countDocuments({
        userId: req.user!._id,
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
  unreadCount = async (req: Request, res: Response): Promise<Response> => {
    const unread = await NotificationModel.countDocuments({
      userId: req.user!._id,
      readAt: { $exists: false },
    });
    return res.status(200).json({
      message: "Done",
      data: { unread },
    });
  };
  markAsRead = async (req: Request, res: Response): Promise<Response> => {
    const { notificationId }: INotificationParamsDTO = req.params as {
      notificationId: string;
    };
    const notification = await NotificationModel.findByIdAndUpdate(
      {
        _id: notificationId,
        userId: req.user!._id,
      },
      { readAt: Date.now() },
      { new: true },
    );
    if (!notification) throw new NotFoundException("Notification not found");

    return res.status(200).json({
      message: "Done",
      data: notification,
    });
  };
  markAllAsRead = async (req: Request, res: Response): Promise<Response> => {
    await NotificationModel.updateMany(
      {
        userId: req.user!._id,
        readAt: { $exists: false },
      },
      { readAt: Date.now() },
    );

    return res.status(200).json({
      message: "All Notifications mark as read",
    });
  };
  deleteNotification = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { notificationId }: INotificationParamsDTO = req.params as {
      notificationId: string;
    };
    const deleted = await NotificationModel.findOneAndDelete({
      _id: notificationId,
      userId: req.user!._id,
    });
    if (!deleted) throw new NotFoundException("Notification not found");

    return res.status(200).json({
      message: "Notification Deleted",
    });
  };
  clearAll = async (req: Request, res: Response): Promise<Response> => {
    const deleted = await NotificationModel.deleteMany({
      userId: req.user!._id,
    });
    if (!deleted) throw new NotFoundException("Notification not found");

    return res.status(200).json({
      message: "All Notifications deleted",
    });
  };
}

export default new Notification();
