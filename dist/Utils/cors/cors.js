"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsOptions = void 0;
const config_1 = require("./../../config/config");
const whiteList = config_1.env.WHITELIST.split(",");
exports.corsOptions = {
    origin(origin, callback) {
        if (!origin)
            return callback(null, true);
        if (whiteList.includes(origin))
            return callback(null, true);
        return callback(new Error("Not Allowed By CORS"));
    },
};
