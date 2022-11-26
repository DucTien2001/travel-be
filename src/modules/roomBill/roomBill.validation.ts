import * as yup from "yup";
import { Request } from "express";
import { VALIDATION } from "../../config/constants";

export default class RoomBillValidation {
  static createRoomBill(req: Request) {
    const schema = yup
      .object({
        userId: yup.number(),
        userMail: yup.string().email(),
        rooms: yup.array(
          yup.object({
            roomId: yup.number(),
            amount: yup.number(),
            discount: yup.string(),
            prices: yup.string(),
            totalPrice: yup.number(),
          })
        ),
        startDate: yup.string(),
        endDate: yup.string(),
        bookedDates: yup.string().nullable(),
        totalBill: yup.number(),
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
  
  static verifyBookRoom(req: Request) {
    const schema = yup
      .object({
        code: yup.string(),
        billId: yup.number(),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }
}
