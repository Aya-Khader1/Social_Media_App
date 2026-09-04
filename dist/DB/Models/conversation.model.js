"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationModel = exports.conversationSchema = void 0;
const mongoose_1 = require("mongoose");
const mongoose_2 = require("mongoose");
exports.conversationSchema = new mongoose_2.Schema({
    participants: [
        {
            type: mongoose_2.Schema.ObjectId,
            ref: "User",
            required: true,
        },
    ],
    lastMessage: { type: String },
    lastMessageAt: { type: Date },
    lastMessageBy: { type: mongoose_2.Schema.ObjectId, ref: "User" },
}, {
    timestamps: true,
});
exports.conversationSchema.index({ participants: 1, createdAt: -1 });
exports.ConversationModel = (0, mongoose_1.model)("Conversation", exports.conversationSchema);
