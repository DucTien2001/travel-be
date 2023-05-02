import Container from "typedi";
import TourBillService from "./tourBill.service";
import TourBillValidation from "./tourBill.validation";
import { Request, Response } from "express";

export default class UserController {
  static update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const value = TourBillValidation.update(req);
      const TourBillServiceI = Container.get(TourBillService);
      TourBillServiceI.update(Number(id), value, req.user, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static findAll(req: Request, res: Response) {
    try {
      const value = TourBillValidation.findAll(req);
      const TourBillServiceI = Container.get(TourBillService);
      TourBillServiceI.findAll(value, req.user, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static findOne(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const TourBillServiceI = Container.get(TourBillService);
      TourBillServiceI.findOne(Number(id), req.user, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }
}