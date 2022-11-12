import * as yup from "yup";
import { Request } from "express";
import { VALIDATION } from "../../config/constants";

export default class UserValidation {
  static login(req: Request) {
    const schema = yup
      .object({
        username: yup.string().email().required(),
        password: yup
          .string()
          .matches(VALIDATION.password, {
            message: req.t("field_password_vali_password"),
            excludeEmptyString: true,
          })
          .required(),
        role: yup.number().required(),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }
  static register(req: Request) {
    const schema = yup
      .object({
        username: yup.string().email().required(),
        password: yup
          .string()
          .matches(VALIDATION.password, {
            message: req.t("field_password_vali_password"),
            excludeEmptyString: true,
          })
          .required(),
        confirmPassword: yup
          .string()
          .matches(VALIDATION.password, {
            message: req.t("field_password_vali_password"),
            excludeEmptyString: true,
          })
          .required(),
        firstName: yup.string().required(),
        lastName: yup.string().required(),
        role: yup.number().required(),
        avatar: yup.string().nullable(),
        address: yup.string().nullable(),
        phoneNumber: yup.string().matches(VALIDATION.phone, {
          message: req.t("field_phone_number_vali_phone"),
          excludeEmptyString: true,
        }),
        introduction: yup.string().nullable(),
        isDeleted: yup.boolean().default(false),
        isVerified: yup.boolean().default(false),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }

  static verifySignup(req: Request) {
    const schema = yup
      .object({
        code: yup.string(),
        userId: yup.number(),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }

  static reSendEmailVerifySignup(req: Request) {
    const schema = yup
      .object({
        email: yup.string().email().required(),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }
  
  static sendEmailForgotPassword(req: Request) {
    const schema = yup
      .object({
        email: yup.string().email().required(),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }

  static changePassword(req: Request) {
    const schema = yup
      .object({
        userId: yup.number(),
        password: yup
          .string()
          .matches(VALIDATION.password, {
            message: req.t("field_password_vali_password"),
            excludeEmptyString: true,
          })
          .required(),
        confirmPassword: yup
          .string()
          .matches(VALIDATION.password, {
            message: req.t("field_password_vali_password"),
            excludeEmptyString: true,
          })
          .required(),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }

  static changePassForgot(req: Request) {
    const schema = yup
      .object({
        email: yup.string().email().required(),
        password: yup
          .string()
          .matches(VALIDATION.password, {
            message: req.t("field_password_vali_password"),
            excludeEmptyString: true,
          })
          .required(),
        confirmPassword: yup
          .string()
          .matches(VALIDATION.password, {
            message: req.t("field_password_vali_password"),
            excludeEmptyString: true,
          })
          .required(),
        code: yup.string(),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }

  static updateUserProfile(req: Request) {
    const schema = yup
      .object({
        avatar: yup.string(),
        firstName: yup.string(),
        lastName: yup.string(),
        address: yup.string(),
        phoneNumber: yup.string().matches(VALIDATION.phone, {
          message: req.t("field_phone_number_vali_phone"),
          excludeEmptyString: true,
        }),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }
}
