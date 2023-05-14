import { Router } from "express";
import TourBillController from "./tourBill.controller";
import { enterprise, staff } from "middlewares";

export const tourBillRouter = Router();

tourBillRouter.route("/").get(staff, TourBillController.findAll);
tourBillRouter.route("/filter").get(staff, TourBillController.getFilters);
tourBillRouter.route("/statistic").get(enterprise, TourBillController.statisticAll);
tourBillRouter.route("/statistic/:id").get(enterprise, TourBillController.statisticOneTour);
tourBillRouter.route("/:id").get(staff, TourBillController.findOne).put(staff ,TourBillController.update);
