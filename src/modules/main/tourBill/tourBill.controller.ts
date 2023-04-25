import Container from "typedi";
import TourBillService from "./tourBill.service";
import TourBillValidation from "./tourBill.validation";
import { Request, Response } from "express";

export default class UserController {
  static create(req: Request, res: Response) {
    try {
      const value = TourBillValidation.create(req);
      const TourBillServiceI = Container.get(TourBillService);
      TourBillServiceI.create(value, req.user, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  // static getTourBill(req: Request, res: Response) {
  //   try {
  //     const { billId } = req.params;
  //     const TourBillServiceI = Container.get(TourBillService);
  //     TourBillServiceI.getTourBill(Number(billId), res);
  //   } catch (error) {
  //     return res.onError({
  //       detail: error,
  //     });
  //   }
  // }
  
  // static getAllTourBills(req: Request, res: Response) {
  //   try {
  //     const { tourId } = req.params;
  //     const TourBillServiceI = Container.get(TourBillService);
  //     TourBillServiceI.getAllTourBills(Number(tourId), res);
  //   } catch (error) {
  //     return res.onError({
  //       detail: error,
  //     });
  //   }
  // }

  // static getAllUserTourBills(req: Request, res: Response) {
  //   try {
  //     const { userId } = req.params;
  //     const TourBillServiceI = Container.get(TourBillService);
  //     TourBillServiceI.getAllUserTourBills(Number(userId), res);
  //   } catch (error) {
  //     return res.onError({
  //       detail: error,
  //     });
  //   }
  // }
  
  // static getAllTourBillsAnyDate(req: Request, res: Response) {
  //   try {
  //     const value = TourBillValidation.getAllTourBillsAnyDate(req);
  //     const TourBillServiceI = Container.get(TourBillService);
  //     TourBillServiceI.getAllTourBillsAnyDate(value, res);
  //   } catch (error) {
  //     return res.onError({
  //       detail: error,
  //     });
  //   }
  // }

  // static createTourBill(req: Request, res: Response) {
  //   try {
  //     const value = TourBillValidation.createTourBill(req);
  //     const TourBillServiceI = Container.get(TourBillService);
  //     TourBillServiceI.createTourBill(value, res);
  //   } catch (error) {
  //     return res.onError({
  //       detail: error,
  //     });
  //   }
  // }
  
  // static verifyBookTour(req: Request, res: Response) {
  //   try {
  //     const value = TourBillValidation.verifyBookTour(req);
  //     const VerifyCodeI = Container.get(TourBillService);
  //     VerifyCodeI.verifyBookTour(value, res);
  //   } catch (error) {
  //     return res.onError({
  //       detail: error,
  //     });
  //   }
  // }
  
  // static getRevenueOfToursByMonth(req: Request, res: Response) {
  //   try {
  //     const value = TourBillValidation.getRevenueOfToursByMonth(req);
  //     const VerifyCodeI = Container.get(TourBillService);
  //     VerifyCodeI.getRevenueOfToursByMonth(value, res);
  //   } catch (error) {
  //     return res.onError({
  //       detail: error,
  //     });
  //   }
  // }
  
  // static getRevenueOfToursByYear(req: Request, res: Response) {
  //   try {
  //     const value = TourBillValidation.getRevenueOfToursByYear(req);
  //     const VerifyCodeI = Container.get(TourBillService);
  //     VerifyCodeI.getRevenueOfToursByYear(value, res);
  //   } catch (error) {
  //     return res.onError({
  //       detail: error,
  //     });
  //   }
  // }
  
  // static cancelTourBill(req: Request, res: Response) {
  //   try {
  //     const { billId } = req.params;
  //     const TourBillServiceI = Container.get(TourBillService);
  //     TourBillServiceI.cancelTourBill(Number(billId), res);
  //   } catch (error) {
  //     return res.onError({
  //       detail: error,
  //     });
  //   }
  // }
}
