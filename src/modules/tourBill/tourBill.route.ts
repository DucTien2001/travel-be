import { Router } from "express";
import TourBillController from "./tourBill.controller";

export const tourBillRouter = Router();

tourBillRouter.route("/get-tour-bill/:billId").get(TourBillController.getTourBill);
tourBillRouter.route("/get-all-tour-bills/:tourId").get(TourBillController.getAllTourBills);
tourBillRouter.route("/get-all-user-tour-bills/:userId").get(TourBillController.getAllUserTourBills);
tourBillRouter.route("/create").post(TourBillController.createTourBill);
