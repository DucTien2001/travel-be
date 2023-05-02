import { Router } from "express";
import TourBillController from "./tourBill.controller";
import { staff } from "middlewares";

export const tourBillRouter = Router();

tourBillRouter.route("/").get(staff, TourBillController.findAll);
tourBillRouter.route("/:id").get(staff, TourBillController.findOne).put(staff ,TourBillController.update);
