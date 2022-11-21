import Container from "typedi";
import { Request, Response } from "express";
import HotelCommentService from "./hotelComment.service";
import HotelCommentValidation from "./hotelComment.validation";

export default class HotelCommentController {
  static getHotelComments(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const HotelCommentServiceI = Container.get(HotelCommentService);
      HotelCommentServiceI.getHotelComments(Number(id), res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static createNewHotelComment(req: Request, res: Response) {
    try {
      const value = HotelCommentValidation.createNewHotelComment(req);
      const HotelCommentServiceI = Container.get(HotelCommentService);
      HotelCommentServiceI.createNewHotelComment(value, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static updateHotelComment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const value = HotelCommentValidation.updateHotelComment(req);
      const HotelCommentServiceI = Container.get(HotelCommentService);
      HotelCommentServiceI.updateHotelComment(Number(id), value, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }
  
  static replyHotelComment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const value = HotelCommentValidation.replyHotelComment(req);
      const HotelCommentServiceI = Container.get(HotelCommentService);
      HotelCommentServiceI.replyHotelComment(Number(id), value, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static deleteHotelComment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const HotelCommentServiceI = Container.get(HotelCommentService);
      HotelCommentServiceI.deleteHotelComment(Number(id), res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }
}
