import { Router } from "express";
import {
  login,
  logoutUser,
  RefreshAccessToken,
  registerUser,
  VerifyEmail,
  ForgotPasswordRequest,
  ResetPassword,
  getCurrentUser,
  changeCurrentPassword,
  ResendEmailVerification,
} from "../controllers/auth.controllers.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
  userRegisterValidator,
  userLoginValidator,
  UserForgotPasswordValidator,
  userResetForgotpassword,
  userchangeCurrentPasswordValidator
} from "../validators/index.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

//unsecured routes
router.route("/register").post(userRegisterValidator(), validate, registerUser);
router.route("/login").post(userLoginValidator(), validate, login);
router.route("/verify-email/:verificationToken").get(VerifyEmail);
router.route("/refresh-token").get(RefreshAccessToken);
router
  .route("/forgot-password")
  .post(UserForgotPasswordValidator(), validate, ForgotPasswordRequest);
router
  .route("/reset-password/:resetToken")
  .post(userResetForgotpassword(), validate, ResetPassword);

//secure routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/current-user").post(verifyJWT, getCurrentUser);
router.route("/change-password").post(verifyJWT,userchangeCurrentPasswordValidator(),validate, changeCurrentPassword);
router.route("/Resend-Email-Verification").post(verifyJWT, ResendEmailVerification);


export default router;
