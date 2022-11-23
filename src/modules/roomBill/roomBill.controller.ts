import Container from "typedi";
import RoomBillService from "./roomBill.service";
import RoomBillValidation from "./roomBill.validation";
import { Request, Response } from "express";

export default class RoomBillController {
  static getRoomBill(req: Request, res: Response) {
    try {
      const { billId } = req.params;
      const RoomBillServiceI = Container.get(RoomBillService);
      RoomBillServiceI.getRoomBill(Number(billId), res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static getAllRoomBills(req: Request, res: Response) {
    try {
      const { roomId } = req.params;
      const RoomBillServiceI = Container.get(RoomBillService);
      RoomBillServiceI.getAllRoomBills(Number(roomId), res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static getAllUserRoomBills(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const RoomBillServiceI = Container.get(RoomBillService);
      RoomBillServiceI.getAllUserRoomBills(Number(userId), res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }
  
  static getRoomBillDetails(req: Request, res: Response) {
    try {
      const { billId } = req.params;
      const RoomBillServiceI = Container.get(RoomBillService);
      RoomBillServiceI.getRoomBillDetails(Number(billId), res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static createRoomBill(req: Request, res: Response) {
    try {
      const value = RoomBillValidation.createRoomBill(req);
      const RoomBillServiceI = Container.get(RoomBillService);
      RoomBillServiceI.createRoomBill(value, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static verifyBookRoom(req: Request, res: Response) {
    try {
      const value = RoomBillValidation.verifyBookRoom(req);
      const VerifyCodeI = Container.get(RoomBillService);
      VerifyCodeI.verifyBookRoom(value, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }
}
