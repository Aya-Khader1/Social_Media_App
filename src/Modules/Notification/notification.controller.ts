import { Router } from "express";
import { authentication } from "../../Middlewares/authentication.middleware";
import { TokenTypeEnum } from "../../Utils/enums/user.enum";
import * as validators from "./notification.validation";
import { validation } from "../../Middlewares/validation.middleware";
import notificationService from "./notification.service";
const router = Router();

router.use(authentication({ tokenType: TokenTypeEnum.ACCESS }));

router.post(
  "/device-token",
  validation(validators.deviceTokenSchema),
  notificationService.deviceToken,
);
router.delete(
  "/remove-token",
  validation(validators.deviceTokenSchema),
  notificationService.removeDeviceToken,
);

router.get(
  "/",
  validation(validators.listNotificationSchema),
  notificationService.listAllNotification,
);
router.get(
  "/unread",
  validation(validators.listNotificationSchema),
  notificationService.unreadCount,
);
router.patch(
  "/mark-as-read/:notificationId",
  validation(validators.notificationParamSchema),
  notificationService.markAsRead,
);
router.patch("/mark-all-as-read", notificationService.markAsRead);

router.delete(
  "/delete/:notificationId",
  validation(validators.notificationParamSchema),
  notificationService.deleteNotification,
);
router.delete("/delete", notificationService.clearAll);
export default router;
