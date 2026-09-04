"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.intializeSocket = exports.getIo = void 0;
const socket_io_1 = require("socket.io");
const token_1 = require("../security/token");
const presence_socket_1 = require("./presence.socket");
const chat_socket_1 = require("./chat.socket");
let io = null;
const getIo = () => io;
exports.getIo = getIo;
const intializeSocket = (httpServer) => {
    io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: "*",
        },
    });
    io.use(async (socket, next) => {
        try {
            const authorization = socket.handshake.auth?.token;
            const { user } = await (0, token_1.decodedToken)({ authorization });
            socket.user = user;
            next();
        }
        catch (error) {
            next(new Error(error.message) || "Unauthorized Socket");
        }
    });
    io.on("connection", (socket) => {
        const user = socket.user;
        const userId = user?._id.toString();
        console.log(`Socket connected:${user?.firstName} (${socket.id})`);
        socket.join(userId);
        (0, presence_socket_1.registerPresenceEvents)(io, socket);
        (0, chat_socket_1.registerChatEvents)(io, socket);
    });
    console.log("[Socket] Socket.IO Server is ready");
    return io;
};
exports.intializeSocket = intializeSocket;
