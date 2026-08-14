"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const error_response_1 = require("../response/error.response");
const nodemailer_1 = require("nodemailer");
const config_1 = require("./../../config/config");
const sendEmail = async (data) => {
    if (!data.html && !data.attachments?.length && !data.text) {
        throw new error_response_1.BadRequestException("Missing Email Content");
    }
    const transporter = (0, nodemailer_1.createTransport)({
        service: "gmail",
        auth: {
            user: config_1.env.EMAIL_USERNAME,
            pass: config_1.env.EMAIL_PASSWORD,
        },
    });
    await transporter.sendMail({
        ...data,
        from: `"Social Media Application"<${config_1.env.EMAIL_USERNAME}>`,
    });
};
exports.sendEmail = sendEmail;
