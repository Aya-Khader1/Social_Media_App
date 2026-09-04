import { Router } from "express";
import { authentication } from "../../Middlewares/authentication.middleware";
import * as validators from "./chat.validation";
import chatService from "./chat.service";
import { validation } from "../../Middlewares/validation.middleware";
import { TokenTypeEnum } from "../../Utils/enums/user.enum";
const router = Router();
router.use(authentication({ tokenType: TokenTypeEnum.ACCESS }));

router.get(
  "/",
  validation(validators.conversationSchema),
  chatService.listConversation,
);
router.get("/unread-count", chatService.unreadCount);
router.get(
  "/:userId",
  validation(validators.getMessageSchema),
  chatService.getMessage,
);

export default router;
