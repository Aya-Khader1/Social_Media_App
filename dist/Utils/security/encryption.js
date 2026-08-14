"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encrypt = void 0;
const node_crypto_1 = __importDefault(require("node:crypto"));
const config_1 = require("./../../config/config");
const ENCRYPTION_SECRET_KEY = Buffer.from(config_1.env.ENCRYPTION_SECRET_KEY, "utf-8");
const IV_LENGTH = 16;
const iv = node_crypto_1.default.randomBytes(IV_LENGTH);
const encrypt = (text) => {
    const cipher = node_crypto_1.default.createCipheriv("aes-256-cbc", ENCRYPTION_SECRET_KEY, iv);
    let encryptedData = cipher.update(text, "utf-8", "hex");
    encryptedData += cipher.final("hex");
    return `${iv.toString("hex")}:${encryptedData}`;
};
exports.encrypt = encrypt;
