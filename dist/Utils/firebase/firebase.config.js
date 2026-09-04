"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.admin = exports.getMessaging = exports.intializeFirebase = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
exports.admin = firebase_admin_1.default;
const node_path_1 = require("node:path");
const node_fs_1 = require("node:fs");
const config_1 = require("./../../config/config");
let messaging = null;
const intializeFirebase = () => {
    const keyPath = (0, node_path_1.resolve)(config_1.env.FIREBASE_SERVICE_ACCOUNT);
    if (!(0, node_fs_1.existsSync)(keyPath))
        throw new Error(`Firebase service account key file not found at path:${keyPath}`);
    try {
        const serviceAccount = JSON.parse((0, node_fs_1.readFileSync)(keyPath, "utf-8"));
        firebase_admin_1.default.initializeApp({
            credential: firebase_admin_1.default.credential.cert(serviceAccount),
        });
        messaging = firebase_admin_1.default.messaging();
        console.log("[Firebase] Admin SDK intialized successfully");
    }
    catch (error) {
        console.log("[Firebase] Error intializing Admin SDK ", error);
    }
};
exports.intializeFirebase = intializeFirebase;
const getMessaging = () => messaging;
exports.getMessaging = getMessaging;
