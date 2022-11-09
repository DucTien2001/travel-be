import Container from "typedi";
import RoomOtherPriceService from "./roomOtherPrice.service";
import RoomOtherPriceValidation from "./roomOtherPrice.validation";
import { Request, Response } from "express";

export default class UserController {
  static getPrice(req: Request, res: Response) {
    try {
      const value = RoomOtherPriceValidation.getPrice(req);
      const RoomOtherPriceServiceI = Container.get(RoomOtherPriceService);
      RoomOtherPriceServiceI.getPrice(value, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static getAllPrices(req: Request, res: Response) {
    try {
      const value = RoomOtherPriceValidation.getAllPrices(req);
      const RoomOtherPriceServiceI = Container.get(RoomOtherPriceService);
      RoomOtherPriceServiceI.getAllPrices(value, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static createNewPrice(req: Request, res: Response) {
    try {
      const value = RoomOtherPriceValidation.createNewPrice(req);
      const RoomOtherPriceServiceI = Container.get(RoomOtherPriceService);
      RoomOtherPriceServiceI.createNewPrice(value, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static updatePrice(req: Request, res: Response) {
    try {
      const value = RoomOtherPriceValidation.updatePrice(req);
      const RoomOtherPriceServiceI = Container.get(RoomOtherPriceService);
      RoomOtherPriceServiceI.updatePrice(value, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static deletePrice(req: Request, res: Response) {
    try {
      const value = RoomOtherPriceValidation.deletePrice(req);
      const RoomOtherPriceServiceI = Container.get(RoomOtherPriceService);
      RoomOtherPriceServiceI.deletePrice(value, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }
}
