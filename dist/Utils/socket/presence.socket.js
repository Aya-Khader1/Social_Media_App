"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerPresenceEvents = void 0;
const user_model_1 = require("../../DB/Models/user.model");
const connected_users_1 = require("./connected.users");
const socket_helper_1 = require("./socket.helper");
const getOnlineFriends = (user) => {
    const onlineIds = (0, connected_users_1.getOnlineUsersIds)();
    return (user.friends ?? [])
        .map((friend) => friend._id.toString())
        .filter((friendId) => onlineIds.includes(friendId));
};
const notifyFriends = (io, user, event, payload) => {
    (user.friends ?? []).forEach((friend) => {
        const friendId = friend._id.toString();
        io.to(friendId).emit(event, payload);
    });
};
const registerPresenceEvents = (io, socket) => {
    const user = socket.user;
    const userId = user?._id.toString();
    const isFirstDevice = (0, connected_users_1.addConnection)(userId, socket.id);
    if (isFirstDevice) {
        notifyFriends(io, user, "userOnline", {
            userId,
            firstName: user?.firstName,
            lastName: user?.lastName,
        });
    }
    socket.emit("onlineFriends", { friends: getOnlineFriends(user) });
    const emptySchema = {};
    socket.on("getOnlineFriends", (0, socket_helper_1.handleEvent)(socket, "getOnlineFriends", emptySchema, () => {
        socket.emit("onlineFriends", { friends: getOnlineFriends(user) });
    }));
    socket.on("disconnect", async () => {
        console.log(`[Socket] disconnected :${user.firstName} (${socket.id})`);
        const isLastDevice = (0, connected_users_1.removeConnection)(userId, socket.id);
        if (!isLastDevice)
            return;
        const lastSeen = new Date();
        await user_model_1.UserModel.updateOne({ _id: userId }, { lastSeen });
        notifyFriends(io, user, "userOffline", { userId, lastSeen });
    });
};
exports.registerPresenceEvents = registerPresenceEvents;
