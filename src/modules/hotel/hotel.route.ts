import { Router } from "express";
import HotelController from "./hotel.controller";

export const hotelRouter = Router();

hotelRouter.route("/get-hotels/:id").get(HotelController.getHotels);
hotelRouter.route("/get-hotel/:hotelId").get(HotelController.getHotel);
hotelRouter.route("/get-all-hotels").get(HotelController.getAllHotels);
hotelRouter.route("/create").post(HotelController.createNewHotel);
hotelRouter.route("/update/:id").put(HotelController.updateHotel);
hotelRouter.route("/delete/:id").put(HotelController.deleteHotel);
hotelRouter.route("/temporarily-stop-working/:id").put(HotelController.temporarilyStopWorking);
hotelRouter.route("/search-hotels/:name").get(HotelController.searchHotels);
