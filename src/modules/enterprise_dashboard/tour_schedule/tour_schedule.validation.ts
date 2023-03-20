import * as yup from "yup";
import { Request } from "express";

export default class Validation {
  static createOne(req: Request) {
    const schema = yup
      .object({
        tourId: yup.number(),
        day: yup.number(),
        startTime: yup.date(),
        endTime: yup.date(),
        description: yup.string(),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }

  static createMultiple(req: Request) {
    const schema = yup
      .object({
        tourId: yup.number(),
        day: yup.number(),
        schedule: yup.array(
          yup.object({
            startTime: yup.date(),
            endTime: yup.date(),
            description: yup.string(),
          })
        ),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }

  static update(req: Request) {
    const schema = yup
      .object({
        startTime: yup.date(),
        endTime: yup.date(),
        description: yup.string(),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }
}
