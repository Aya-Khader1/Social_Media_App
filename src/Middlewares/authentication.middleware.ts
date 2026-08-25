import { NextFunction, Request, Response } from "express";
import { decodedToken } from "./../Utils/security/token";
import {
  TokenTypeEnum,
  SignatureEnum,
  RoleEnum,
} from "./../Utils/enums/user.enum";
import { ForbiddenException } from "../Utils/response/error.response";
export const authentication = ({
  tokenType = TokenTypeEnum.ACCESS,
  signatureLevel = SignatureEnum.USER,
}: {
  tokenType?: TokenTypeEnum;
  signatureLevel?: SignatureEnum;
}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { user, decoded } = await decodedToken({
      authorization: req.headers.authorization,
      tokenType,
      signatureLevel,
    });
    req.user = user;
    req.decoded = decoded;

    return next();
  };
};

export const authorization = ({
  accessRoles = [],
}: {
  accessRoles?: RoleEnum[];
}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!accessRoles.includes(req.user.role))
      throw new ForbiddenException("Unauthorized Access");
    return next();
  };
};
