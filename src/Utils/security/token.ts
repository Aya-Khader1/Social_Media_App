import { JwtPayload, Secret, sign, SignOptions, verify } from "jsonwebtoken";
import { HUserDocument, UserModel } from "../../DB/Models/user.model";
import { RoleEnum, SignatureEnum, TokenTypeEnum } from "../enums/user.enum";
import { env } from "./../../config/config";
import {
  BadRequestException,
  UnauthorizedException,
} from "../response/error.response";
export interface ITokenPayload extends JwtPayload {
  _id: string;
  role: RoleEnum;
}

type SignatureType = {
  accessSignature: string;
  refreshSignature: string;
};
export const generateToken = ({
  payload,
  secret,
  option,
}: {
  payload: object;
  secret: Secret;
  option: SignOptions;
}) => {
  return sign(payload, secret, option);
};
export const verifyToken = ({
  token,
  secret,
}: {
  token: string;
  secret: Secret;
}): ITokenPayload => {
  return verify(token, secret) as ITokenPayload;
};

export const getSignature = ({
  signatureLevel = SignatureEnum.USER,
}: {
  signatureLevel?: SignatureEnum;
}): SignatureType => {
  switch (signatureLevel) {
    case SignatureEnum.ADMIN:
      return {
        accessSignature: env.ACCESS_ADMIN_SIGNATURE,
        refreshSignature: env.REFRESH_ADMIN_SIGNATURE,
      };

    case SignatureEnum.USER:
    default:
      return {
        accessSignature: env.ACCESS_USER_SIGNATURE,
        refreshSignature: env.REFRESH_USER_SIGNATURE,
      };
  }
};

export const createLoginCredentials = (
  user: HUserDocument,
): { accessToken: string; refreshToken: string } => {
  const isAdmin = user.role === RoleEnum.ADMIN;
  const accessSecret = isAdmin
    ? env.ACCESS_ADMIN_SIGNATURE
    : env.ACCESS_USER_SIGNATURE;
  const refreshSecret = isAdmin
    ? env.REFRESH_ADMIN_SIGNATURE
    : env.REFRESH_USER_SIGNATURE;
  const accessToken = generateToken({
    payload: { _id: user._id },
    secret: accessSecret,
    option: { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN },
  });
  const refreshToken = generateToken({
    payload: { _id: user._id },
    secret: refreshSecret,
    option: { expiresIn: env.REFRESH_TOKEN_EXPIRES_IN },
  });

  return { accessToken, refreshToken };
};
export const decodedToken = async ({
  authorization,
  tokenType = TokenTypeEnum.ACCESS,
  signatureLevel = SignatureEnum.USER,
}: {
  authorization: string | undefined;
  tokenType?: TokenTypeEnum;
  signatureLevel?: SignatureEnum;
}): Promise<{ user: HUserDocument; decoded: ITokenPayload }> => {
  if (!authorization)
    throw new UnauthorizedException("Missing authorization header");
  const [bearer, token] = authorization.split(" ");
  if (bearer !== "Bearer" || !token)
    throw new UnauthorizedException("Invalid Authorization Format");
  const signature = getSignature({
    signatureLevel:
      signatureLevel === "ADMIN"
        ? SignatureEnum.ADMIN
        : signatureLevel === "USER"
          ? SignatureEnum.USER
          : (() => {
              throw new UnauthorizedException("Invalid Signature");
            })(),
  });

  let decoded: ITokenPayload;
  try {
    decoded = verifyToken({
      token,
      secret:
        tokenType === TokenTypeEnum.ACCESS
          ? signature.accessSignature
          : signature.refreshSignature,
    });
  } catch {
    throw new UnauthorizedException("Invalid Token");
  }

  if (!decoded._id) throw new UnauthorizedException("Invalid token payload");
  const user = await UserModel.findById(decoded._id);
  if (!user) throw new BadRequestException("Account not find");
  return { user, decoded };
};
