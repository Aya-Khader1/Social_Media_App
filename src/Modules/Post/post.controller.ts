import { Router } from "express";
import postService from "./post.service";
import * as validator from "./post.validation";
import {
  localFileUpload,
  fileValidation,
} from "../../Utils/multer/local.multer";
import { validation } from "../../Middlewares/validation.middleware";
import { authentication } from "../../Middlewares/authentication.middleware";
import { TokenTypeEnum } from "../../Utils/enums/user.enum";

const router = Router();
router.use(authentication({ tokenType: TokenTypeEnum.ACCESS }));
router.post(
  "/create-post",

  localFileUpload({ validation: fileValidation.image, folder: "posts" }).array(
    "attachments",
    20,
  ),
  validation(validator.createPostSchema),

  postService.createPost,
);

router.patch(
  "/:postId/like",
  validation(validator.postIdParamsSchema),

  postService.toggleLikePost,
);

router.patch(
  "/:postId/update",
  validation(validator.postIdParamsSchema),

  postService.updatePost,
);
router.delete(
  "/:postId/delete",
  validation(validator.postIdParamsSchema),

  postService.deletePost,
);
router.get(
  "/:postId",
  validation(validator.postIdParamsSchema),
  postService.getSpecificPost,
);

router.post(
  "/:postId/comment",
  validation(validator.createCommentSchema),
  postService.createComment,
);
router.patch(
  "/comment/:commentId",
  validation(validator.updateCommentSchema),
  postService.updateComment,
);
router.delete(
  "/comment/:commentId",
  validation(validator.CommentIdParamsSchema),
  postService.deleteComment,
);
export default router;
