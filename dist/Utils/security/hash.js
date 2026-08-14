"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareHash = exports.generateHash = void 0;
const bcrypt_1 = require("bcrypt");
const config_1 = require("./../../config/config");
const generateHash = async (plaintext, saltRounds = Number(config_1.env.SALT)) => {
    return await (0, bcrypt_1.hash)(plaintext, saltRounds);
};
exports.generateHash = generateHash;
const compareHash = async (plaintext, hashValue) => {
    return await (0, bcrypt_1.compare)(plaintext, hashValue);
};
exports.compareHash = compareHash;
