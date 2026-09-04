"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("./../config/config");
const connectDB = async () => {
    try {
        const conn = await mongoose_1.default.connect(config_1.env.MONGO_URI, {
        //serverSelectionTimeoutMS: 5000,
        });
        console.log(`MongoDB Connected:${conn.connection.host}`);
    }
    catch (error) {
        console.log(`MongoDB Connection error:${error.message}`);
        throw error;
    }
};
exports.connectDB = connectDB;
exports.default = exports.connectDB;
