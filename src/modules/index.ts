import { Router } from "express";
import { hotelRouter } from "./hotel";
import { hotelCommentRouter } from "./hotelComment";
import { roomRouter } from "./room";
import { roomBillRouter } from "./roomBill";
import { roomOtherPriceRouter } from "./roomOtherPrice";
import { tourRouter } from "./tour";
import { tourBillRouter } from "./tourBill";
import { tourCommentRouter } from "./tourComment";
import { userRouter } from "./user";

export const mainRouter = Router();

mainRouter.use("/user", userRouter);
mainRouter.use("/tour", tourRouter);
mainRouter.use("/hotel", hotelRouter);
mainRouter.use("/room", roomRouter);
mainRouter.use("/room-other-price", roomOtherPriceRouter);
mainRouter.use("/tour-bill", tourBillRouter);
mainRouter.use("/room-bill", roomBillRouter);
mainRouter.use("/tour-comment", tourCommentRouter);
mainRouter.use("/hotel-comment", hotelCommentRouter);
