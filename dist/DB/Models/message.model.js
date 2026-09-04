"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageModel = exports.messageSchema = void 0;
const mongoose_1 = require("mongoose");
const mongoose_2 = require("mongoose");
exports.messageSchema = new mongoose_2.Schema({
    content: {
        type: String,
        minLength: 1,
        maxLength: 500000,
        trim: true,
        required: true,
    },
    senderId: { type: mongoose_2.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose_2.Schema.Types.ObjectId, ref: "User", required: true },
    conversationId: {
        type: mongoose_2.Schema.Types.ObjectId,
        ref: "Conversation",
        required: true,
    },
    readAt: { type: Date },
}, {
    timestamps: true,
});
exports.messageSchema.index({ conversationId: 1, createdAt: -1 });
exports.messageSchema.index({ senderId: 1, readAt: -1 });
exports.messageSchema.pre("validate", async function () {
    if (this.content)
        this.content = this.content.trim();
});
exports.MessageModel = (0, mongoose_1.model)("Message", exports.messageSchema);
