"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const conversation_model_1 = require("../../DB/Models/conversation.model");
const connected_users_1 = require("../../Utils/socket/connected.users");
const message_model_1 = require("../../DB/Models/message.model");
class ChatService {
    constructor() { }
    listConversation = async (req, res) => {
        const { page, limit } = req.query;
        const skip = (page - 1) * limit;
        const filter = { participants: req.user._id };
        const [conversation, total] = await Promise.all([
            conversation_model_1.ConversationModel.find(filter)
                .sort({ lastMessageAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("participants"),
            conversation_model_1.ConversationModel.countDocuments(filter),
        ]);
        const data = conversation.map((conversation) => {
            const other = conversation.participants.find((participants) => {
                participants._id.toString() !== req.user._id.toString();
            });
            return {
                _id: conversation._id,
                user: other,
                lastMessage: conversation.lastMessage,
                lastMessageAt: conversation.lastMessageAt,
                isOnline: other ? (0, connected_users_1.isUserOnline)(other._id.toString()) : false,
            };
        });
        return res.status(200).json({
            message: "success",
            data: {
                conversation,
                pagination: { page, limit, total, pages: Math.ceil(total / limit) },
            },
        });
    };
    getMessage = async (req, res) => {
        const { userId } = req.params;
        const { page, limit } = req.query;
        const skip = (page - 1) * limit;
        const conversation = await conversation_model_1.ConversationModel.findOne({
            participants: { $all: [req.user._id, userId] },
        });
        if (!conversation) {
            return res.status(200).json({
                message: "Success",
                data: {
                    messages: [],
                    pagination: { page, limit, total: 0, pages: 0 },
                },
            });
        }
        const filter = { conversationId: conversation._id };
        const [messages, total] = await Promise.all([
            message_model_1.MessageModel.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("senderId"),
            message_model_1.MessageModel.countDocuments(filter),
        ]);
        return res.status(200).json({
            message: "success",
            data: {
                conversation: conversation._id,
                messages: messages,
                pagination: { page, limit, total, pages: Math.ceil(total / limit) },
            },
        });
    };
    unreadCount = async (req, res) => {
        const unread = await message_model_1.MessageModel.countDocuments({
            receiverId: req.user._id,
            readAt: { $exists: false },
        });
        return res.status(200).json({
            message: "success",
            data: {
                unread,
            },
        });
    };
}
exports.ChatService = ChatService;
exports.default = new ChatService();
