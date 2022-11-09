import { Router } from "express";
import RoomController from "./room.controller";

export const roomRouter = Router();

roomRouter.route("/get-room/:roomId").get(RoomController.getRoom);
roomRouter.route("/get-rooms/:id").get(RoomController.getRooms);
roomRouter.route("/get-all-tours").get(RoomController.getAllRooms);
roomRouter.route("/create").post(RoomController.createNewRoom);
roomRouter.route("/update-information/:id").put(RoomController.updateRoomInformation);
roomRouter.route("/update-price/:id").put(RoomController.updateRoomPrice);
roomRouter.route("/delete/:id").put(RoomController.deleteRoom);
roomRouter.route("/temporarily-stop-working/:id").put(RoomController.temporarilyStopWorking);
