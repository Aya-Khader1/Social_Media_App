"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class User {
    getProfile = async (req, res) => {
        const { user } = req;
        return res.status(201).json({ message: "login", user });
    };
}
exports.default = new User();
