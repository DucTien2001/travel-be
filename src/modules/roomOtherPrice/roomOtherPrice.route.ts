import { Router } from "express";
import RoomOtherPriceController from "./roomOtherPrice.controller";

export const roomOtherPriceRouter = Router();

roomOtherPriceRouter.route("/get-price").get(RoomOtherPriceController.getPrice);
roomOtherPriceRouter.route("/get-all-prices").get(RoomOtherPriceController.getAllPrices);
roomOtherPriceRouter.route("/create").post(RoomOtherPriceController.createNewPrice);
roomOtherPriceRouter.route("/update").put(RoomOtherPriceController.updatePrice);
roomOtherPriceRouter.route("/delete").put(RoomOtherPriceController.deletePrice);
