import * as yup from "yup";
import { Request } from "express";

export default class TourBillValidation {
  static update(req: Request) {
    const schema = yup
      .object({
        status: yup.number(),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }

  static findAll(req: Request) {
    const schema = yup
      .object({
        take: yup.number().integer().default(10),
        page: yup.number().min(1).integer().default(1),
        keyword: yup.string(),
      })
      .noUnknown();
    return schema.validateSync(req.query);
  }
}
