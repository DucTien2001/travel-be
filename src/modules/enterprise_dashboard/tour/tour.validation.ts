import * as yup from "yup";
import { Request } from "express";

export default class Validation {
  static findAll(req: Request) {
    const schema = yup.object({
      take: yup.number()
        .integer()
        .default(10),
      page: yup.number()
        .min(1)
        .integer()
        .default(1),
      keyword: yup.string(),
      categoryId: yup.number()
    })
      .noUnknown()
    return schema.validateSync(req.query)
  }
  
  static create(req: Request) {
    const schema = yup
      .object({
        title: yup.string(),
        quantity: yup.number(),
        numberOfDays: yup.number(),
        numberOfNights: yup.number(),
        city: yup.string(),
        district: yup.string(),
        moreLocation: yup.string(),
        commune: yup.string(),
        contact: yup.string(),
        description: yup.string(),
        suitablePerson: yup.string(),
        highlight: yup.string(),
        termsAndCondition: yup.string(),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }
}
