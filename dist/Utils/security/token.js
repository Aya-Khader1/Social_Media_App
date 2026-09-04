"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodedToken = exports.createLoginCredentials = exports.getSignature = exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const user_model_1 = require("../../DB/Models/user.model");
const user_enum_1 = require("../enums/user.enum");
const config_1 = require("./../../config/config");
const error_response_1 = require("../response/error.response");
const generateToken = ({ payload, secret, option, }) => {
    return (0, jsonwebtoken_1.sign)(payload, secret, option);
};
exports.generateToken = generateToken;
const verifyToken = ({ token, secret, }) => {
    return (0, jsonwebtoken_1.verify)(token, secret);
};
exports.verifyToken = verifyToken;
const getSignature = ({ signatureLevel = user_enum_1.SignatureEnum.USER, }) => {
    switch (signatureLevel) {
        case user_enum_1.SignatureEnum.ADMIN:
            return {
                accessSignature: config_1.env.ACCESS_ADMIN_SIGNATURE,
                refreshSignature: config_1.env.REFRESH_ADMIN_SIGNATURE,
            };
        case user_enum_1.SignatureEnum.USER:
        default:
            return {
                accessSignature: config_1.env.ACCESS_USER_SIGNATURE,
                refreshSignature: config_1.env.REFRESH_USER_SIGNATURE,
            };
    }
};
exports.getSignature = getSignature;
const createLoginCredentials = (user) => {
    const isAdmin = user.role === user_enum_1.RoleEnum.ADMIN;
    const accessSecret = isAdmin
        ? config_1.env.ACCESS_ADMIN_SIGNATURE
        : config_1.env.ACCESS_USER_SIGNATURE;
    const refreshSecret = isAdmin
        ? config_1.env.REFRESH_ADMIN_SIGNATURE
        : config_1.env.REFRESH_USER_SIGNATURE;
    const accessToken = (0, exports.generateToken)({
        payload: { _id: user._id },
        secret: accessSecret,
        option: { expiresIn: config_1.env.ACCESS_TOKEN_EXPIRES_IN },
    });
    const refreshToken = (0, exports.generateToken)({
        payload: { _id: user._id },
        secret: refreshSecret,
        option: { expiresIn: config_1.env.REFRESH_TOKEN_EXPIRES_IN },
    });
    return { accessToken, refreshToken };
};
exports.createLoginCredentials = createLoginCredentials;
const decodedToken = async ({ authorization, tokenType = user_enum_1.TokenTypeEnum.ACCESS, signatureLevel = user_enum_1.SignatureEnum.USER, }) => {
    if (!authorization)
        throw new error_response_1.UnauthorizedException("Missing authorization header");
    const [bearer, token] = authorization.split(" ");
    if (bearer !== "Bearer" || !token)
        throw new error_response_1.UnauthorizedException("Invalid Authorization Format");
    const signature = (0, exports.getSignature)({
        signatureLevel: signatureLevel === "ADMIN"
            ? user_enum_1.SignatureEnum.ADMIN
            : signatureLevel === "USER"
                ? user_enum_1.SignatureEnum.USER
                : (() => {
                    throw new error_response_1.UnauthorizedException("Invalid Signature");
                })(),
    });
    let decoded;
    try {
        decoded = (0, exports.verifyToken)({
            token,
            secret: tokenType === user_enum_1.TokenTypeEnum.ACCESS
                ? signature.accessSignature
                : signature.refreshSignature,
        });
    }
    catch {
        throw new error_response_1.UnauthorizedException("Invalid Token");
    }
    if (!decoded._id)
        throw new error_response_1.UnauthorizedException("Invalid token payload");
    const user = await user_model_1.UserModel.findById(decoded._id).populate("friends", "firstName lastName email");
    if (!user)
        throw new error_response_1.BadRequestException("Account not find");
    return { user, decoded };
};
exports.decodedToken = decodedToken;
