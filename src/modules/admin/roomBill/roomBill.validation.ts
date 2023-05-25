import * as yup from "yup";
import { Request } from "express";

export default class TourBillValidation {
  static statisticAllUsers(req: Request) {
    const schema = yup
      .object({
        take: yup.number().integer().default(10),
        page: yup.number().min(1).integer().default(1),
        keyword: yup.string(),
        month: yup.number().integer(),
        year: yup.number().integer(),
        sort: yup.number().integer(),
      })
      .noUnknown();
    return schema.validateSync(req.query);
  }

  static statisticOneUser(req: Request) {
    const schema = yup
      .object({
        take: yup.number().integer().default(10),
        page: yup.number().min(1).integer().default(1),
        keyword: yup.string(),
        month: yup.number().integer(),
        year: yup.number().integer(),
      })
      .noUnknown();
    return schema.validateSync(req.query);
  }

  static statisticOneStay(req: Request) {
    const schema = yup
      .object({
        take: yup.number().integer().default(10),
        page: yup.number().min(1).integer().default(1),
        month: yup.number().integer(),
        year: yup.number().integer(),
      })
      .noUnknown();
    return schema.validateSync(req.query);
  }

  static statisticOneRoom(req: Request) {
    const schema = yup
      .object({
        take: yup.number().integer().default(10),
        page: yup.number().min(1).integer().default(1),
        month: yup.number().integer(),
        year: yup.number().integer(),
      })
      .noUnknown();
    return schema.validateSync(req.query);
  }
}
