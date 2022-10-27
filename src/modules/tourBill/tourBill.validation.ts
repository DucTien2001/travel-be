import * as yup from "yup";
import { Request } from "express";
import { VALIDATION } from "../../config/constants";

export default class TourValidation {
  static createTourBill(req: Request) {
    const schema = yup
      .object({
        userId: yup.number(),
        tourId: yup.number(),
        amount: yup.number(),
        price: yup.number(),
        discount: yup.number(),
        email: yup.string().email(),
        phoneNumber: yup.string().matches(VALIDATION.phone, {
          message: req.t("field_phone_number_vali_phone"),
          excludeEmptyString: true,
        }),
        firstName: yup.string(),
        lastName: yup.string(),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }
}
