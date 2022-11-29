import { Router } from "express";
import RoomBillController from "./roomBill.controller";

export const roomBillRouter = Router();

roomBillRouter.route("/get-room-bill/:billId").get(RoomBillController.getRoomBill);
roomBillRouter.route("/get-room-bill-details/:billId").get(RoomBillController.getRoomBillDetails);
roomBillRouter.route("/get-all-room-bills/:roomId").get(RoomBillController.getAllRoomBills);
roomBillRouter.route("/get-all-user-room-bills/:userId").get(RoomBillController.getAllUserRoomBills);
roomBillRouter.route("/create").post(RoomBillController.createRoomBill);
roomBillRouter.route("/verify-book-room").post(RoomBillController.verifyBookRoom);
roomBillRouter.route("/get-hotels-revenue-by-month").post(RoomBillController.getRevenueOfHotelsByMonth);
roomBillRouter.route("/get-hotels-revenue-by-year").post(RoomBillController.getRevenueOfHotelsByYear);
