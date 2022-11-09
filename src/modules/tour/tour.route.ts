import { Router } from "express";
import TourController from "./tour.controller";

export const tourRouter = Router();

tourRouter.route("/get-tours/:id").get(TourController.getTours);
tourRouter.route("/get-tour/:tourId").get(TourController.getTour);
tourRouter.route("/get-all-tours").get(TourController.getAllTours);
tourRouter.route("/create").post(TourController.createNewTour);
tourRouter.route("/update/:id").put(TourController.updateTour);
tourRouter.route("/delete/:id").put(TourController.deleteTour);
tourRouter.route("/temporarily-stop-working/:id").put(TourController.temporarilyStopWorking);
