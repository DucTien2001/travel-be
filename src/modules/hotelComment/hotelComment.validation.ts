import * as yup from "yup";
import { Request } from "express";

export default class HotelCommentValidation {
  static createNewHotelComment(req: Request) {
    const schema = yup
      .object({
        comment: yup.string(),
        rate: yup.string(),
        hotelId: yup.number(),
        billId: yup.number(),
        userId: yup.number(),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }

  static updateHotelComment(req: Request) {
    const schema = yup
      .object({
        comment: yup.string(),
        rate: yup.string(),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }
  
  static replyHotelComment(req: Request) {
    const schema = yup
      .object({
        replyComment: yup.string(),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }
}
