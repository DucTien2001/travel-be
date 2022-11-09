import { Router } from "express";
import RoomBillController from "./roomBill.controller";

export const roomBillRouter = Router();

roomBillRouter.route("/get-room-bill/:billId").get(RoomBillController.getRoomBill);
roomBillRouter.route("/get-all-room-bills/:roomId").get(RoomBillController.getAllRoomBills);
roomBillRouter.route("/get-all-user-room-bills/:userId").get(RoomBillController.getAllUserRoomBills);
roomBillRouter.route("/create").post(RoomBillController.createRoomBill);
