import { Router } from "express";
import TourCommentController from "./tourComment.controller";

export const tourCommentRouter = Router();

tourCommentRouter.route("/get-tours-comment/:id").get(TourCommentController.getTourComments);
tourCommentRouter.route("/get-all-tour-comments").post(TourCommentController.getAllTourComments);
tourCommentRouter.route("/get-all-tour-comments").post(TourCommentController.getAllTourComments);
tourCommentRouter.route("/create").post(TourCommentController.createNewTourComment);
tourCommentRouter.route("/update/:id").put(TourCommentController.updateTourComment);
tourCommentRouter.route("/reply/:id").put(TourCommentController.replyTourComment);
tourCommentRouter.route("/request-delete/:id").put(TourCommentController.requestDeleteTourComment);
tourCommentRouter.route("/delete/:id").put(TourCommentController.deleteTourComment);
