import {
  authentication,
  authorization,
} from "../../Middlewares/authentication.middleware";
import { TokenTypeEnum, RoleEnum } from "../../Utils/enums/user.enum";
import userService from "./user.service";
import { Router } from "express";
const router = Router();

router.get(
  "/get-profile",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  authorization({ accessRoles: [RoleEnum.USER, RoleEnum.ADMIN] }),
  userService.getProfile,
);

export default router;
