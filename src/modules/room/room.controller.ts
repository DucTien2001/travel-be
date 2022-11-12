import Container from "typedi";
import RoomService from "./room.service";
import RoomValidation from "./room.validation";
import { Request, Response } from "express";

export default class RoomController {
  static getRoom(req: Request, res: Response) {
    try {
      const { roomId } = req.params;
      const RoomServiceI = Container.get(RoomService);
      RoomServiceI.getRoom(Number(roomId), res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static getRooms(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const RoomServiceI = Container.get(RoomService);
      RoomServiceI.getRooms(Number(id), res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static getAllRooms(req: Request, res: Response) {
    try {
      const RoomServiceI = Container.get(RoomService);
      RoomServiceI.getAllRooms(res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static createNewRoom(req: Request, res: Response) {
    try {
      const value = RoomValidation.createNewRoom(req);
      const RoomServiceI = Container.get(RoomService);
      RoomServiceI.createNewRoom(value, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static updateRoomInformation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const value = RoomValidation.updateRoomInformation(req);
      const RoomServiceI = Container.get(RoomService);
      RoomServiceI.updateRoomInformation(Number(id), value, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static updateRoomPrice(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const value = RoomValidation.updateRoomPrice(req);
      const RoomServiceI = Container.get(RoomService);
      RoomServiceI.updateRoomPrice(Number(id), value, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }
  
  static temporarilyStopWorking(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const RoomServiceI = Container.get(RoomService);
      RoomServiceI.temporarilyStopWorking(Number(id), res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static deleteRoom(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const RoomServiceI = Container.get(RoomService);
      RoomServiceI.deleteRoom(Number(id), res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }
}
