"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorization = exports.authentication = void 0;
const token_1 = require("./../Utils/security/token");
const user_enum_1 = require("./../Utils/enums/user.enum");
const error_response_1 = require("../Utils/response/error.response");
const authentication = ({ tokenType = user_enum_1.TokenTypeEnum.ACCESS, signatureLevel = user_enum_1.SignatureEnum.USER, }) => {
    return async (req, res, next) => {
        const { user, decoded } = await (0, token_1.decodedToken)({
            authorization: req.headers.authorization,
            tokenType,
            signatureLevel,
        });
        req.user = user;
        req.decoded = decoded;
        return next();
    };
};
exports.authentication = authentication;
const authorization = ({ accessRoles = [], }) => {
    return async (req, res, next) => {
        if (!accessRoles.includes(req.user.role))
            throw new error_response_1.ForbiddenException("Unauthorized Access");
        return next();
    };
};
exports.authorization = authorization;
