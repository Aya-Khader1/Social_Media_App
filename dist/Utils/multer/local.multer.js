"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.magicNumberValidation = exports.localFileUpload = exports.uploadDir = exports.fileValidation = void 0;
const multer_1 = __importDefault(require("multer"));
const node_fs_1 = require("node:fs");
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const node_crypto_1 = require("node:crypto");
const file_type_1 = require("file-type");
const error_response_1 = require("../response/error.response");
exports.fileValidation = {
    image: ["image/png", "image/jpeg", "image/jpg", "image/webp"],
};
exports.uploadDir = "./upload";
const localFileUpload = ({ validation = exports.fileValidation.image, maxSizeMB = 5, folder = "general", } = {}) => {
    const storage = multer_1.default.diskStorage({
        destination(req, file, callback) {
            const distPth = (0, node_path_1.resolve)(exports.uploadDir, folder);
            if (!(0, node_fs_1.existsSync)(distPth)) {
                (0, node_fs_1.mkdirSync)(distPth, { recursive: true });
            }
            callback(null, distPth);
        },
        filename(req, file, callback) {
            const ext = file.originalname.split(".").pop();
            callback(null, `${Date.now()}_${(0, node_crypto_1.randomUUID)()}.${ext}`);
        },
    });
    const fileFilter = (req, file, cb) => {
        if (!validation.includes(file.mimetype) &&
            file.mimetype !== "application/octet-stream") {
            return cb(new error_response_1.BadRequestException(`Invalid File Format ${file.mimetype}`));
        }
        cb(null, true);
    };
    return (0, multer_1.default)({
        storage,
        fileFilter,
        limits: {
            fileSize: maxSizeMB * 1024 * 1024,
        },
    });
};
exports.localFileUpload = localFileUpload;
const magicNumberValidation = async ({ filePath, validation, }) => {
    const fileType = await (0, file_type_1.fileTypeFromFile)(filePath);
    if (!fileType) {
        await (0, promises_1.unlink)(filePath);
        throw new error_response_1.BadRequestException("Unable to determine file type");
    }
    if (!validation.includes(fileType.mime)) {
        await (0, promises_1.unlink)(filePath);
        throw new error_response_1.BadRequestException(`Invalid File Format ${fileType.mime}`);
    }
    return fileType;
};
exports.magicNumberValidation = magicNumberValidation;
