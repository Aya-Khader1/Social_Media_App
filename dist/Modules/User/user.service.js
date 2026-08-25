"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_response_1 = require("../../Utils/response/error.response");
const user_model_1 = require("../../DB/Models/user.model");
const friendRequest_model_1 = require("../../DB/Models/friendRequest.model");
const mongoose_1 = require("mongoose");
class User {
    constructor() { }
    getProfile = async (req, res) => {
        const { user } = req;
        return res.status(201).json({ message: "login", user });
    };
    sendFriendsRequest = async (req, res) => {
        const { userId } = req.params;
        const senderId = req.user._id;
        if (userId === senderId.toString())
            throw new error_response_1.BadRequestException("You cannot add yourself");
        const target = await user_model_1.UserModel.findById(userId);
        if (!target)
            throw new error_response_1.NotFoundException("User Not Found");
        if (target.blockedUser?.some((id) => id.equals(senderId) ||
            req.user.blockedUser?.some((id) => id.equals(target._id))))
            throw new error_response_1.ForbiddenException("Cannot send request to this user");
        if (target.friends?.some((id) => id.equals(senderId)))
            throw new error_response_1.ConflictException("You are already friends");
        const existing = await friendRequest_model_1.FriendRequestModel.findOne({
            $or: [
                { sendBy: senderId, sendTo: userId },
                { sendBy: userId, sendTo: senderId },
            ],
        });
        if (existing)
            throw new error_response_1.ConflictException("Friend Request already exists");
        const friendRequest = await friendRequest_model_1.FriendRequestModel.create({
            sendBy: senderId,
            sendTo: userId,
        });
        return res
            .status(201)
            .json({ message: "Friend Request send", data: { friendRequest } });
    };
    listFriendRequests = async (req, res) => {
        const friendRequest = await friendRequest_model_1.FriendRequestModel.find({
            sendTo: req.user._id,
        })
            .populate("sendBy", "firstName lastName email -_id")
            .lean();
        return res.status(200).json({ message: "Done", data: { friendRequest } });
    };
    acceptFriendRequest = async (req, res) => {
        const { requestId } = req.params;
        const friendRequest = await friendRequest_model_1.FriendRequestModel.findOne({
            _id: requestId,
            sendTo: req.user._id,
        });
        if (!friendRequest)
            throw new error_response_1.NotFoundException("Friend Request not found");
        await Promise.all([
            user_model_1.UserModel.updateOne({
                _id: friendRequest.sendBy,
            }, {
                $addToSet: { friends: friendRequest.sendTo },
            }),
            user_model_1.UserModel.updateOne({
                _id: friendRequest.sendBy,
            }, {
                $addToSet: { friends: friendRequest.sendTo },
            }),
        ]);
        await friendRequest_model_1.FriendRequestModel.deleteOne({ _id: requestId });
        return res.status(200).json({ message: "Friend Request accepted" });
    };
    rejectFriendRequest = async (req, res) => {
        const { requestId } = req.params;
        const friendRequest = await friendRequest_model_1.FriendRequestModel.findOneAndDelete({
            _id: requestId,
            $or: [
                {
                    sendTo: req.user._id,
                },
                {
                    sendBy: req.user._id,
                },
            ],
        });
        if (!friendRequest)
            throw new error_response_1.NotFoundException("Friend Request not found");
        return res.status(200).json({ message: "Friend Request removed" });
    };
    removeFriend = async (req, res) => {
        const { userId } = req.params;
        const myId = req.user._id;
        await Promise.all([
            user_model_1.UserModel.updateOne({ _id: myId }, { $pull: { friends: userId } }),
            user_model_1.UserModel.updateOne({ _id: userId }, { $pull: { friends: myId } }),
        ]);
        return res.status(200).json({ message: "Friend Removed Successfully" });
    };
    blockUser = async (req, res) => {
        const { userId } = req.params;
        const myId = req.user._id;
        if (userId == myId.toString())
            throw new error_response_1.BadRequestException("You cannot block yourself");
        const target = await user_model_1.UserModel.findById(userId);
        if (!target)
            throw new error_response_1.NotFoundException("User Not Found");
        await Promise.all([
            user_model_1.UserModel.updateOne({ _id: myId }, {
                $addToSet: { blockedUser: new mongoose_1.Types.ObjectId(userId) },
                $pull: { friends: userId },
            }),
            user_model_1.UserModel.updateOne({ _id: userId }, {
                $pull: { friends: myId },
            }),
            friendRequest_model_1.FriendRequestModel.deleteMany({
                $or: [
                    { sendBy: myId, sendTo: userId },
                    { sendBy: userId, sendTo: myId },
                ],
            }),
        ]);
        return res.status(200).json({ message: "User Blocked Successfully" });
    };
    unBlockUser = async (req, res) => {
        const { userId } = req.params;
        const updated = await user_model_1.UserModel.updateOne({ _id: req.user._id }, { $pull: { blockUser: userId } });
        if (!updated)
            throw new error_response_1.BadRequestException("User Not Found or invalid unblock user");
        return res.status(200).json({ message: "User unBlocked Successfully" });
    };
}
exports.default = new User();
