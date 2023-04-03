import * as yup from "yup";
import { Request } from "express";

export default class Validation {
  static create(req: Request) {
    const schema = yup
      .object({
        tourId: yup.number(),
        discount: yup.number(),
        quantity: yup.number(),
        startDate: yup.date(),
        childrenAgeMin: yup.number(),
        childrenAgeMax: yup.number(),
        childrenPrice: yup.number(),
        adultPrice: yup.number(),
        currency: yup.string(),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }

  static update(req: Request) {
    const schema = yup
      .object({
        discount: yup.number(),
        quantity: yup.number(),
        startDate: yup.date(),
        childrenAgeMin: yup.number(),
        childrenAgeMax: yup.number(),
        childrenPrice: yup.number(),
        adultPrice: yup.number(),
        currency: yup.string(),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }
}
