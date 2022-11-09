import { Router } from "express";
import { auth } from "middlewares";
import UserController from "./user.controller";

export const userRouter = Router();

userRouter.route("/login").post(UserController.login);
userRouter.route("/register").post(UserController.register);
userRouter.route("/me").get(auth, UserController.me);
userRouter.route("/verify-signup").post(UserController.verifySignup);
