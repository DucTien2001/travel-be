import * as yup from "yup";
import { Request } from "express";

export default class TourValidation {
  static createNewTour(req: Request) {
    const schema = yup
      .object({
        title: yup.string(),
        description: yup.string(),
        businessHours: yup.string(),
        location: yup.string(),
        contact: yup.string(),
        price: yup.number(),
        discount: yup.number(),
        tags: yup.string().nullable(),
        images: yup.string().nullable(),
        creator: yup.number(),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }

  static updateTour(req: Request) {
    const schema = yup
      .object({
        title: yup.string(),
        description: yup.string(),
        businessHours: yup.string(),
        location: yup.string(),
        contact: yup.string(),
        price: yup.number(),
        discount: yup.number(),
        tags: yup.string().nullable(),
        images: yup.string().nullable(),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }
}
