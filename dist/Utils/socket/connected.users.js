"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserSocketCount = exports.getOnlineUsersIds = exports.isUserOnline = exports.removeConnection = exports.addConnection = void 0;
const connectedUsers = new Map();
const addConnection = (userId, socketId) => {
    const sockets = connectedUsers.get(userId);
    if (!sockets) {
        connectedUsers.set(userId, new Set([socketId]));
        return true;
    }
    sockets.add(socketId);
    return false;
};
exports.addConnection = addConnection;
const removeConnection = (userId, socketId) => {
    const sockets = connectedUsers.get(userId);
    if (!sockets)
        return true;
    sockets.delete(socketId);
    if (sockets.size > 0)
        return false;
    connectedUsers.delete(userId);
    return true;
};
exports.removeConnection = removeConnection;
const isUserOnline = (userId) => {
    return connectedUsers.has(userId);
};
exports.isUserOnline = isUserOnline;
const getOnlineUsersIds = () => {
    return [...connectedUsers.keys()];
};
exports.getOnlineUsersIds = getOnlineUsersIds;
const getUserSocketCount = (userId) => {
    return connectedUsers.get(userId)?.size ?? 0;
};
exports.getUserSocketCount = getUserSocketCount;
