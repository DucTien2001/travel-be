import { Router } from "express";
import HotelCommentController from "./hotelComment.controller";

export const hotelCommentRouter = Router();

hotelCommentRouter.route("/get-hotels-comment/:id").get(HotelCommentController.getHotelComments);
hotelCommentRouter.route("/create").post(HotelCommentController.createNewHotelComment);
hotelCommentRouter.route("/update/:id").put(HotelCommentController.updateHotelComment);
hotelCommentRouter.route("/reply/:id").put(HotelCommentController.replyHotelComment);
hotelCommentRouter.route("/delete/:id").put(HotelCommentController.deleteHotelComment);
