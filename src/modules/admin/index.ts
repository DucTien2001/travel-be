import { Router } from "express";
import { userRouter } from "./user";
import { eventRouter } from "./event";
import { commissionRouter } from "./commission";
import { tourBillRouter } from "./tourBill";
import { roomBillRouter } from "./roomBill";

export const adminRouter = Router();

adminRouter.use("/user", userRouter);
adminRouter.use("/event", eventRouter);
adminRouter.use("/commission", commissionRouter);
adminRouter.use("/tour-bill", tourBillRouter);
adminRouter.use("/room-bill", roomBillRouter);
