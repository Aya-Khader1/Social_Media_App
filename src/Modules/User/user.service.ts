import { Response, Request } from "express";
import { IRequestIdParamsDTO, IUserIdParamsDTO } from "./user.dto";
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "../../Utils/response/error.response";
import { UserModel } from "../../DB/Models/user.model";
import { FriendRequestModel } from "../../DB/Models/friendRequest.model";
import { Types } from "mongoose";
import { notificationEvent } from "../../Utils/events/notification.event";

class User {
  constructor() {}
  getProfile = async (req: Request, res: Response): Promise<Response> => {
    const { user } = req;

    return res.status(201).json({ message: "login", user });
  };

  sendFriendsRequest = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { userId }: IUserIdParamsDTO = req.params as { userId: string };
    const senderId = req.user!._id;

    if (userId === senderId.toString())
      throw new BadRequestException("You cannot add yourself");
    const target = await UserModel.findById(userId);
    if (!target) throw new NotFoundException("User Not Found");

    if (
      target.blockedUser?.some(
        (id) =>
          id.equals(senderId) ||
          req.user!.blockedUser?.some((id) => id.equals(target._id)),
      )
    )
      throw new ForbiddenException("Cannot send request to this user");
    if (target.friends?.some((id) => id.equals(senderId)))
      throw new ConflictException("You are already friends");

    const existing = await FriendRequestModel.findOne({
      $or: [
        { sendBy: senderId, sendTo: userId },
        { sendBy: userId, sendTo: senderId },
      ],
    });
    if (existing) throw new ConflictException("Friend Request already exists");
    const friendRequest = await FriendRequestModel.create({
      sendBy: senderId,
      sendTo: userId,
    });
    notificationEvent.emit("friendRequest", {
      to: target._id,
      sendBy: senderId,
      sendTo: friendRequest._id,
    });
    return res
      .status(201)
      .json({ message: "Friend Request send", data: { friendRequest } });
  };

  listFriendRequests = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const friendRequest = await FriendRequestModel.find({
      sendTo: req.user!._id,
    })
      .populate("sendBy", "firstName lastName email -_id")
      .lean();
    return res.status(200).json({ message: "Done", data: { friendRequest } });
  };

  acceptFriendRequest = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { requestId }: IRequestIdParamsDTO = req.params as {
      requestId: string;
    };
    const friendRequest = await FriendRequestModel.findOne({
      _id: requestId,
      sendTo: req.user!._id,
    });
    if (!friendRequest) throw new NotFoundException("Friend Request not found");
    await Promise.all([
      UserModel.updateOne(
        {
          _id: friendRequest.sendBy,
        },
        {
          $addToSet: { friends: friendRequest.sendTo },
        },
      ),
      UserModel.updateOne(
        {
          _id: friendRequest.sendTo,
        },
        {
          $addToSet: { friends: friendRequest.sendBy },
        },
      ),
    ]);
    await FriendRequestModel.deleteOne({ _id: requestId });
    notificationEvent.emit("friendRequestAccepted", {
      to: friendRequest.sendBy,
      sendBy: req.user!,
    });
    return res.status(200).json({ message: "Friend Request accepted" });
  };

  rejectFriendRequest = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { requestId }: IRequestIdParamsDTO = req.params as {
      requestId: string;
    };
    const friendRequest = await FriendRequestModel.findOneAndDelete({
      _id: requestId,
      $or: [
        {
          sendTo: req.user!._id,
        },
        {
          sendBy: req.user!._id,
        },
      ],
    });
    if (!friendRequest) throw new NotFoundException("Friend Request not found");

    return res.status(200).json({ message: "Friend Request removed" });
  };
  removeFriend = async (req: Request, res: Response): Promise<Response> => {
    const { userId }: IUserIdParamsDTO = req.params as { userId: string };
    const myId = req.user!._id;
    await Promise.all([
      UserModel.updateOne({ _id: myId }, { $pull: { friends: userId } }),
      UserModel.updateOne({ _id: userId }, { $pull: { friends: myId } }),
    ]);
    return res.status(200).json({ message: "Friend Removed Successfully" });
  };
  blockUser = async (req: Request, res: Response): Promise<Response> => {
    const { userId }: IUserIdParamsDTO = req.params as { userId: string };
    const myId = req.user!._id;
    if (userId == myId.toString())
      throw new BadRequestException("You cannot block yourself");

    const target = await UserModel.findById(userId);
    if (!target) throw new NotFoundException("User Not Found");

    await Promise.all([
      UserModel.updateOne(
        { _id: myId },
        {
          $addToSet: { blockedUser: new Types.ObjectId(userId) },
          $pull: { friends: userId },
        },
      ),
      UserModel.updateOne(
        { _id: userId },
        {
          $pull: { friends: myId },
        },
      ),
      FriendRequestModel.deleteMany({
        $or: [
          { sendBy: myId, sendTo: userId },
          { sendBy: userId, sendTo: myId },
        ],
      }),
    ]);

    return res.status(200).json({ message: "User Blocked Successfully" });
  };
  unBlockUser = async (req: Request, res: Response): Promise<Response> => {
    const { userId }: IUserIdParamsDTO = req.params as { userId: string };
    const updated = await UserModel.updateOne(
      { _id: req.user!._id },
      { $pull: { blockUser: userId } },
    );
    if (!updated)
      throw new BadRequestException("User Not Found or invalid unblock user");
    return res.status(200).json({ message: "User unBlocked Successfully" });
  };
}
export default new User();
