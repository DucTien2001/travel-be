import { Router } from "express";
import { policyRouter } from "./policy";
import { tourRouter } from "./tour";
import { tourOnSaleRouter } from "./tour_on_sale";
import { tourPriceRouter } from "./tour_price";
import { tourScheduleRouter } from "./tour_schedule";
import { voucherRouter } from "./voucher";
import { staffRouter } from "./staff";

export const enterpriseRouter = Router();

enterpriseRouter.use("/tour", tourRouter);
enterpriseRouter.use("/tour-schedule", tourScheduleRouter);
enterpriseRouter.use("/tour-on-sale", tourOnSaleRouter);
enterpriseRouter.use("/tour-price", tourPriceRouter);
enterpriseRouter.use("/policy", policyRouter);
enterpriseRouter.use("/voucher", voucherRouter);
enterpriseRouter.use("/staff", staffRouter);
