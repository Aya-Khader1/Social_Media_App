"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = require("../../DB/Models/user.model");
const error_response_1 = require("../../Utils/response/error.response");
const hash_1 = require("../../Utils/security/hash");
const generateOTP_1 = require("../../Utils/generateOTP");
const email_events_1 = require("../../Utils/events/email.events");
const token_1 = require("../../Utils/security/token");
class AuthService {
    constructor() { }
    signup = async (req, res) => {
        const { username, email, password } = req.body;
        const checkUserExists = await user_model_1.UserModel.findOne({ email }).select("email");
        if (checkUserExists)
            throw new error_response_1.ConflictException("User already exists");
        const otp = (0, generateOTP_1.generateOTP)();
        const [user] = await user_model_1.UserModel.create([
            {
                username,
                email,
                password: await (0, hash_1.generateHash)(password),
                confirmEmailOTP: await (0, hash_1.generateHash)(otp),
            },
        ], { validateBeforeSave: true });
        email_events_1.emailEvents.emit("confirmEmail", {
            to: email,
            username,
            otp,
        });
        return res.status(201).json({ message: "Done", user });
    };
    confirmEmail = async (req, res) => {
        const { email, otp } = req.body;
        const user = await user_model_1.UserModel.findOne({
            email,
            confirmEmailOTP: { $exists: true },
            confirmAt: { $exists: false },
        });
        if (!user || !user.confirmEmailOTP)
            throw new error_response_1.NotFoundException("Invalid Account");
        if (!(await (0, hash_1.compareHash)(otp, user.confirmEmailOTP)))
            throw new error_response_1.BadRequestException("Invalid OTP");
        await user_model_1.UserModel.updateOne({
            email,
        }, {
            confirmAt: Date.now(),
            $unset: { confirmEmailOTP: true },
            $inc: { __v: 1 },
        });
        return res.status(201).json({ message: "User Confirmed Successfully" });
    };
    login = async (req, res) => {
        const { email, password } = req.body;
        const user = await user_model_1.UserModel.findOne({
            email,
            confirmAt: { $exists: true },
        });
        if (!user)
            throw new error_response_1.NotFoundException("Invalid Account");
        if (!(await (0, hash_1.compareHash)(password, user.password)))
            throw new error_response_1.BadRequestException("Invalid Password");
        const credentials = (0, token_1.createLoginCredentials)(user);
        return res.status(201).json({ message: "Done", credentials });
    };
}
exports.default = new AuthService();
