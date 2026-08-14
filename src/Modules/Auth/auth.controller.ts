import authService from "./auth.service";
import { Router } from "express";
import * as validators from "./auth.validation";
import { validation } from "../../Middlewares/validation.middleware";
const router = Router();

router.post("/signup", validation(validators.signUpSchema), authService.signup);
router.post("/login", validation(validators.loginSchema), authService.login);

router.patch(
  "/confirm-email",
  validation(validators.confirmEmailSchema),
  authService.confirmEmail,
);

export default router;
