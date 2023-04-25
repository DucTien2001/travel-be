import { Router } from "express";
import TourBillController from "./tourBill.controller";
import { auth } from "middlewares";

export const tourBillRouter = Router();

tourBillRouter.route("/").get(auth, TourBillController.findAll).post(auth ,TourBillController.create);
tourBillRouter.route("/:id").get(auth, TourBillController.findOne).put(auth ,TourBillController.update);
tourBillRouter.route("/pay-again/:id").get(auth ,TourBillController.againLink);
// tourBillRouter.route("/get-tour-bill/:billId").get(TourBillController.getTourBill);
// tourBillRouter.route("/get-all-tour-bills/:tourId").get(TourBillController.getAllTourBills);
// tourBillRouter.route("/get-all-user-tour-bills/:userId").get(TourBillController.getAllUserTourBills);
// tourBillRouter.route("/get-tour-bills-any-date").post(TourBillController.getAllTourBillsAnyDate);
// tourBillRouter.route("/create").post(TourBillController.createTourBill);
// tourBillRouter.route("/cancel-tour-bill/:billId").put(TourBillController.cancelTourBill);
// tourBillRouter.route("/verify-book-tour").post(TourBillController.verifyBookTour);
// tourBillRouter.route("/get-tours-revenue-by-month").post(TourBillController.getRevenueOfToursByMonth);
// tourBillRouter.route("/get-tours-revenue-by-year").post(TourBillController.getRevenueOfToursByYear);
