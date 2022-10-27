import { Router } from "express";
import UserController from "./user.controller";

export const userRouter = Router();

userRouter.route("/login").post(UserController.login);
userRouter.route("/register").post(UserController.register);
