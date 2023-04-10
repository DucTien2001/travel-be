import { Router } from "express";
import { userRouter } from "./user";

export const adminRouter = Router();

adminRouter.use("/user", userRouter);
