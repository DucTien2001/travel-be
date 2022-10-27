import Container, { Inject, Service } from "typedi";
import bcrypt from "bcryptjs";
import { ILogin, IRegister } from "./user.models";
import database, { sequelize } from "database/models";
import { Response } from "express";
import EmailService from "services/emailService";
import jwt from "helper/jwt";

const hashUserPassword = (password: string) => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

const comparePassword = (plainText: string, encrypedPassword: string) => {
  return bcrypt.compareSync(plainText || '', encrypedPassword);
}

@Service()
export default class UserService {
  constructor(@Inject("usersModel") private usersModel: ModelsInstance.Users) {}
  public async register(data: IRegister, res: Response) {
    const t = await sequelize.transaction();
    try {
      const user = await this.usersModel.findOne({
        where: {
          username: data.username,
        },
      });
      if (user) {
        await t.rollback();
        return res.onError({
          status: 400,
          detail: res.locals.t("auth_email_address_already_exists"),
        });
      }
      if (data?.password !== data?.confirmPassword) {
        await t.rollback();
        return res.onError({
          status: 400,
          detail: res.locals.t("password_and_confirm_password_do_not_match"),
        });
      }
      const hashedPassword = await hashUserPassword(data?.password);
      const userNew = await this.usersModel.create(
        {
          username: data?.username,
          password: hashedPassword,
          role: data?.role || "user",
          avatar: data?.avatar || null,
          firstName: data?.firstName,
          lastName: data?.lastName,
          address: data?.address || null,
          phoneNumber: data?.phoneNumber,
          introduction: data?.introduction || null,
        },
        {
          transaction: t,
        }
      );
      // const temp = await EmailService.sendConfirmSignUp(data?.username, "https://www.google.com/")
      // await t.commit();
      // return res.onSuccess(temp, {
      //   message: res.locals.t("user_create_success"),
      // });
      // const verifyCode = await this.verifyCodesModel.create({
      //   code: uuidv4(),
      //   userId: userNew.id,
      //   state: data.state,
      //   type: ETypeVerifyCode.VERIFY_EMAIL,
      //   expiredDate: moment().add(process.env.MAXAGE_TOKEN_ACTIVE, "hours").toDate()
      // }, { transaction: t })
      // const emailService = Container.get(EmailService);
      // const emailRes = await emailService.sendEmail({
      //   language: lang,
      //   template: EmailTemplates.VERIFY_EMAIL,
      //   email_to: [data.email],
      //   object: {
      //     name: userNew.firstName,
      //     link: `${process.env.SITE_URL}/callback/user/active/${verifyCode.code}`
      //   }
      // }, res)
      // if (emailRes.error) {
      //   await t.rollback();
      //   return res.onError({
      //     status: 500,
      //     detail: emailRes.error
      //   })
      // }
      await t.commit();
      return res.onSuccess(userNew, {
        message: res.locals.t("user_create_success"),
      });
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async login(data: ILogin, res: Response) {
    try {
      const user = await this.usersModel.findOne({
        where: {
          username: data.username
        },
      })
      if (!user) {
        return res.onError({
          status: 400,
          detail: res.locals.t('login_invalid_error')
        })
      }
      const authenticated = comparePassword(data.password, user.password || '');
      if (!authenticated) {
        return res.onError({
          status: 400,
          detail: res.locals.t('login_invalid_error')
        })
      }
      // if (!user.isVerified) {
      //   return res.onError({
      //     status: 400,
      //     detail: "notVerified" // not set i18
      //   })
      // }
      const _user = user.toJSON() as ModelsAttributes.User
      delete _user.password
      const token = jwt.issue(_user);

      return res.onSuccess({
        user: _user,
        token
      })
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error
      })
    }
  }
  
}

