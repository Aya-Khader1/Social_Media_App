import { authentication } from "../../Middlewares/authentication.middleware";
import { validation } from "../../Middlewares/validation.middleware";
import * as validator from "./user.validation";

import { TokenTypeEnum } from "../../Utils/enums/user.enum";
import userService from "./user.service";
import { Router } from "express";
const router = Router();
router.use(authentication({ tokenType: TokenTypeEnum.ACCESS }));
router.get("/get-profile", userService.getProfile);
router.post(
  "/friend-request/:userId",
  validation(validator.userIdParamsSchema),
  userService.sendFriendsRequest,
);
router.get("/friend-request", userService.listFriendRequests);

router.patch(
  "/friend-request/:requestId/accept",
  validation(validator.requestIdParamsSchema),
  userService.acceptFriendRequest,
);
router.delete(
  "/friend-request/:requestId/reject",
  validation(validator.requestIdParamsSchema),
  userService.rejectFriendRequest,
);
router.delete(
  "/friend/:userId",
  validation(validator.userIdParamsSchema),
  userService.removeFriend,
);
router.patch(
  "/block/:userId",
  validation(validator.userIdParamsSchema),
  userService.blockUser,
);
router.patch(
  "/unblock/:userId",
  validation(validator.userIdParamsSchema),
  userService.unBlockUser,
);
export default router;
