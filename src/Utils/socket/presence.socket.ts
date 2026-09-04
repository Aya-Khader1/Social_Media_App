import { HUserDocument, UserModel } from "../../DB/Models/user.model";
import {
  addConnection,
  getOnlineUsersIds,
  removeConnection,
} from "./connected.users";
import { Server } from "socket.io";
import { AuthedSocket } from "./socket.service";
import { handleEvent } from "./socket.helper";
import { ZodType } from "zod";
const getOnlineFriends = (user: HUserDocument): string[] => {
  const onlineIds = getOnlineUsersIds();

  return (user.friends ?? [])
    .map((friend) => friend._id.toString())
    .filter((friendId) => onlineIds.includes(friendId));
};

const notifyFriends = (
  io: Server,
  user: HUserDocument,
  event: string,
  payload: Record<string, unknown>,
): void => {
  (user.friends ?? []).forEach((friend) => {
    const friendId = friend._id.toString();

    io.to(friendId).emit(event, payload);
  });
};

export const registerPresenceEvents = (
  io: Server,
  socket: AuthedSocket,
): void => {
  const user = socket.user!;
  const userId = user?._id.toString() as string;

  const isFirstDevice = addConnection(userId, socket.id);
  if (isFirstDevice) {
    notifyFriends(io, user, "userOnline", {
      userId,
      firstName: user?.firstName,
      lastName: user?.lastName,
    });
  }
  socket.emit("onlineFriends", { friends: getOnlineFriends(user) });
  const emptySchema = {} as ZodType;
  socket.on(
    "getOnlineFriends",
    handleEvent(socket, "getOnlineFriends", emptySchema, () => {
      socket.emit("onlineFriends", { friends: getOnlineFriends(user) });
    }),
  );
  socket.on("disconnect", async () => {
    console.log(`[Socket] disconnected :${user.firstName} (${socket.id})`);
    const isLastDevice = removeConnection(userId, socket.id);
    if (!isLastDevice) return;
    const lastSeen = new Date();

    await UserModel.updateOne({ _id: userId }, { lastSeen });

    notifyFriends(io, user, "userOffline", { userId, lastSeen });
  });
};
