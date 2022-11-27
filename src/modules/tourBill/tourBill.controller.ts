import Container from "typedi";
import TourBillService from "./tourBill.service";
import TourBillValidation from "./tourBill.validation";
import { Request, Response } from "express";

export default class UserController {
  static getTourBill(req: Request, res: Response) {
    try {
      const { billId } = req.params;
      const TourBillServiceI = Container.get(TourBillService);
      TourBillServiceI.getTourBill(Number(billId), res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }
  
  static getAllTourBills(req: Request, res: Response) {
    try {
      const { tourId } = req.params;
      const TourBillServiceI = Container.get(TourBillService);
      TourBillServiceI.getAllTourBills(Number(tourId), res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static getAllUserTourBills(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const TourBillServiceI = Container.get(TourBillService);
      TourBillServiceI.getAllUserTourBills(Number(userId), res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static createTourBill(req: Request, res: Response) {
    try {
      const value = TourBillValidation.createTourBill(req);
      const TourBillServiceI = Container.get(TourBillService);
      TourBillServiceI.createTourBill(value, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }
  
  static verifyBookTour(req: Request, res: Response) {
    try {
      const value = TourBillValidation.verifyBookTour(req);
      const VerifyCodeI = Container.get(TourBillService);
      VerifyCodeI.verifyBookTour(value, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }
  
  static getRevenueOfToursByMonth(req: Request, res: Response) {
    try {
      const value = TourBillValidation.getRevenueOfToursByMonth(req);
      const VerifyCodeI = Container.get(TourBillService);
      VerifyCodeI.getRevenueOfToursByMonth(value, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }
}
