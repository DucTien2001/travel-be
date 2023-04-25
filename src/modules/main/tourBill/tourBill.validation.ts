import * as yup from "yup";
import { Request } from "express";
import { VALIDATION } from "config/constants";

export default class TourBillValidation {
  static create(req: Request) {
    const schema = yup
      .object({
        tourId: yup.number(),
        tourOnSaleId: yup.number(),
        amountChild: yup.number(),
        amountAdult: yup.number(),
        price: yup.number(),
        discount: yup.number(),
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

  // static createTourBill(req: Request) {
  //   const schema = yup
  //     .object({
  //       userId: yup.number(),
  //       userMail: yup.string().email(),
  //       tourId: yup.number(),
  //       amount: yup.number(),
  //       price: yup.number(),
  //       discount: yup.number(),
  //       email: yup.string().email(),
  //       phoneNumber: yup.string().matches(VALIDATION.phone, {
  //         message: req.t("field_phone_number_vali_phone"),
  //         excludeEmptyString: true,
  //       }),
  //       firstName: yup.string(),
  //       lastName: yup.string(),
  //       bankName: yup.string(),
  //       bankAccountName: yup.string(),
  //       bankNumber: yup.string(),
  //       accountExpirationDate: yup.date(),
  //       deposit: yup.number(),
  //     })
  //     .noUnknown()
  //     .required();
  //   return schema.validateSync(req.body);
  // }
  
  // static verifyBookTour(req: Request) {
  //   const schema = yup
  //     .object({
  //       code: yup.string(),
  //       billId: yup.number(),
  //     })
  //     .noUnknown()
  //     .required();
  //   return schema.validateSync(req.body);
  // }
  
  // static getRevenueOfToursByMonth(req: Request) {
  //   const schema = yup
  //     .object({
  //       tourIds: yup.array().of(yup.number()),
  //       month: yup.number(),
  //       year: yup.number(),
  //     })
  //     .noUnknown()
  //     .required();
  //   return schema.validateSync(req.body);
  // }
  
  // static getRevenueOfToursByYear(req: Request) {
  //   const schema = yup
  //     .object({
  //       tourIds: yup.array().of(yup.number()),
  //       year: yup.number(),
  //     })
  //     .noUnknown()
  //     .required();
  //   return schema.validateSync(req.body);
  // }
  
  // static getAllTourBillsAnyDate(req: Request) {
  //   const schema = yup
  //     .object({
  //       tourIds: yup.array().of(yup.number()),
  //       date: yup.date(),
  //     })
  //     .noUnknown()
  //     .required();
  //   return schema.validateSync(req.body);
  // }
}
