import * as yup from "yup";
import { Request } from "express";

export default class Validation {
  static create(req: Request) {
    const schema = yup
      .object({
        serviceId: yup.number(),
        serviceType: yup.number(),
        policyType: yup.number(),
        dayRange: yup.number(),
        moneyRate: yup.number(),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }

  static update(req: Request) {
    const schema = yup
      .object({
        policyType: yup.number(),
        dayRange: yup.number(),
        moneyRate: yup.number(),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }
}
