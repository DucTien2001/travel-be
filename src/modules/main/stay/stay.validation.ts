import * as yup from "yup";
import { Request } from "express";

export default class Validation {
  static findAll(req: Request) {
    const schema = yup
      .object({
        take: yup.number().min(1).integer().default(10),
        page: yup.number().min(1).integer().default(1),
        keyword: yup.string(),
        numberOfAdult: yup.number().integer(),
        numberOfChildren: yup.number().integer(),
        startDate: yup.date(),
        endDate: yup.date(),
        numberOfRoom: yup.number().integer(),
        sort: yup.number().integer(),
      })
      .noUnknown();
    return schema.validateSync(req.query);
  }
}
