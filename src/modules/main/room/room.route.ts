import { Router } from "express";
import RoomController from "./room.controller";

export const roomRouter = Router();

roomRouter.route("/get-room/:roomId").get(RoomController.getRoom);
roomRouter.route("/get-rooms-available").post(RoomController.getRoomsAvailable);
roomRouter.route("/get-all-rooms/:hotelId").get(RoomController.getAllRoomsOfHotel);
roomRouter.route("/create").post(RoomController.createNewRoom);
roomRouter.route("/update-information/:id").put(RoomController.updateRoomInformation);
roomRouter.route("/update-price/:id").put(RoomController.updateRoomPrice);
roomRouter.route("/delete/:id").put(RoomController.deleteRoom);
roomRouter.route("/temporarily-stop-working/:id").put(RoomController.temporarilyStopWorking);
roomRouter.route("/work-again/:id").put(RoomController.workAgain);
