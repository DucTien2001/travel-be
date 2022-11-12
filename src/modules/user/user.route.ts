import { Router } from "express";
import { auth } from "middlewares";
import UserController from "./user.controller";

export const userRouter = Router();

userRouter.route("/login").post(UserController.login);
userRouter.route("/register").post(UserController.register);
userRouter.route("/me").get(auth, UserController.me);
userRouter.route("/verify-signup").post(UserController.verifySignup);
userRouter.route("/re-send-email-verify-signup").put(UserController.reSendEmailVerifySignup);
userRouter.route("/send-email-forgot-password/:id").put(UserController.sendEmailForgotPassword);
userRouter.route("/change-password").put(UserController.changePassword);
userRouter.route("/change-forgot-password").put(UserController.changePassForgot);
userRouter.route("/profile/:id").get(UserController.getUserProfile);
userRouter.route("/update-profile/:id").put(UserController.updateUserProfile);
