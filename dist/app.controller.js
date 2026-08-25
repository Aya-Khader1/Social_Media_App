"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrap = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cors_2 = require("./Utils/cors/cors");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const error_response_1 = require("./Utils/response/error.response");
const Modules_1 = require("./Modules");
const connection_1 = __importDefault(require("./DB/connection"));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 40 * 1000,
    limit: 50,
    message: "Too Many requests,please try again later",
    legacyHeaders: false,
    standardHeaders: "draft-8",
});
const bootstrap = async () => {
    const app = (0, express_1.default)();
    await (0, connection_1.default)();
    app.use(express_1.default.json());
    app.use((0, cors_1.default)(cors_2.corsOptions), limiter, (0, helmet_1.default)());
    app.get("/", (req, res) => {
        return res.json({ message: "Appliction Success" }).status(200);
    });
    app.use("/api/v1/auth", Modules_1.authController);
    app.use("/api/v1/user", Modules_1.userController);
    app.use("/api/v1/post", Modules_1.postController);
    app.use((req, res) => {
        throw new error_response_1.NotFoundException("Route Not Found");
    });
    app.use(error_response_1.globalErrorHandler);
    app.listen(3000, () => {
        console.log(`Server is running on http://127.0.0.1:3000`);
    });
};
exports.bootstrap = bootstrap;
