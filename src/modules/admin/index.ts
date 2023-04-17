import { Router } from "express";
import { userRouter } from "./user";
import { eventRouter } from "./event";

export const adminRouter = Router();

adminRouter.use("/user", userRouter);
adminRouter.use("/event", eventRouter);
