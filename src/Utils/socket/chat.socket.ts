import { Types } from "mongoose";
import { HUserDocument, UserModel } from "../../DB/Models/user.model";
import {
  ForbiddenException,
  NotFoundException,
} from "../response/error.response";
import { ConversationModel } from "../../DB/Models/conversation.model";
import { Server } from "socket.io";
import { AuthedSocket } from "./socket.service";
import * as validators from "../../Modules/chat/chat.validation";
import { handleEvent } from "./socket.helper";
import { MessageModel } from "../../DB/Models/message.model";
import { isUserOnline } from "./connected.users";
const getChatPartener = async (
  me: HUserDocument,
  otherId: string,
): Promise<HUserDocument> => {
  const other = await UserModel.findById(otherId);
  if (!other) throw new NotFoundException("User Not Found");

  const isBlockedHim = me.blockedUser?.some((id) => id.equals(other._id));
  const heBlockedMe = other.blockedUser?.some((id) => id.equals(me._id));

  if (isBlockedHim || heBlockedMe)
    throw new ForbiddenException("You cannot message this user");
  if (!me.friends?.some((id) => id.equals(other._id)))
    throw new ForbiddenException("You can only chat with friends");

  return other;
};

const findOrCreateConversation = async (
  userA: Types.ObjectId,
  userB: Types.ObjectId,
) => {
  const existing = await ConversationModel.findOne({
    participants: { $all: [userA, userB] },
  });

  if (existing) {
    return existing;
  }

  return ConversationModel.create({
    participants: [userA, userB],
  });
};

export const registerChatEvents = (io: Server, socket: AuthedSocket): void => {
  const user = socket.user!;
  const userId = user?._id.toString() as string;
  socket.on(
    "sendMessage",
    handleEvent(
      socket,
      "sendMessage",
      validators.sendMessageSchema,
      async (data) => {
        const reciver = await getChatPartener(user, data.to);
        const conversation = await findOrCreateConversation(
          user._id,
          reciver._id,
        );
        const message = await MessageModel.create({
          conversationId: conversation._id,
          senderId: user._id,
          receiverId: reciver._id,
          content: data.content,
        });
        await ConversationModel.updateOne(
          { _id: conversation._id },
          {
            lastMessage: message.content,
            lastMessageAt: message.createdAt,
            lastMessageBy: user._id,
          },
        );

        const payload = {
          _id: message._id,
          conversationId: conversation._id,
          content: message.content,
          createdAt: message.createdAt,
          receiverId: reciver._id,
          sender: {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
          },
        };

        io.to(data.to).emit("newMessage", payload);

        io.to(userId).emit("messageSent", {
          ...payload,
          delivered: isUserOnline(data.to),
        });
      },
    ),
  );

  socket.on(
    "typing",
    handleEvent(socket, "typing", validators.typingSchema, (data) => {
      io.to(data.to).emit("userTyping", { userId, firstName: user.firstName });
    }),
  );
  socket.on(
    "stopTyping",
    handleEvent(socket, "stopTyping", validators.typingSchema, (data) => {
      io.to(data.to).emit("userStopTyping", {
        userId,
        firstName: user.firstName,
      });
    }),
  );

  socket.on(
    "markAsRead",
    handleEvent(
      socket,
      "markAsRead",
      validators.markAsReadSchema,
      async (data) => {
        const readAt = Date.now();
        const results = await MessageModel.updateMany(
          {
            senderId: data.from,
            receiverId: user._id,
            readAt: { $exists: false },
          },
          { readAt },
        );
        if (results.modifiedCount > 0) {
          io.to(data.from).emit("messagesRead", {
            by: userId,
            readAt,
            count: results.modifiedCount,
          });
        }
      },
    ),
  );
};
