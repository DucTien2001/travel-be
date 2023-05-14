import { Inject, Service } from "typedi";
import { ChangeRole, FindAll, SendOffer } from "./staff.models";
import { Response } from "express";
import { WhereOptions } from "sequelize/types";
import EmailService from "services/emailService";
import { sequelize } from "database/models";
import { ETypeUser, ETypeVerifyCode } from "common/general";
import moment from "moment";

@Service()
export default class StaffService {
  constructor(
    @Inject("usersModel") private usersModel: ModelsInstance.Users,
    @Inject("verifyCodesModel") private verifyCodesModel: ModelsInstance.VerifyCodes
  ) {}
  /**
   * Get all user profile
   */
  public async findAll(data: FindAll, user: ModelsAttributes.User, res: Response) {
    try {
      const whereOptions: WhereOptions = {
        isDeleted: false,
        enterpriseId: user.id,
      };

      const offset = data.take * (data.page - 1);

      const listUsers = await this.usersModel.findAndCountAll({
        where: whereOptions,
        limit: data.take,
        offset: offset,
        distinct: true,
      });

      return res.onSuccess(listUsers.rows, {
        meta: {
          take: data.take,
          itemCount: listUsers.count,
          page: data.page,
          pageCount: Math.ceil(listUsers.count / data.take),
        },
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  /**
   * offer staff
   */
  public async sendOffer(data: SendOffer, user: ModelsAttributes.User, res: Response) {
    const t = await sequelize.transaction();
    try {
      const staff = await this.usersModel.findOne({
        where: {
          username: data.email,
          enterpriseId: null,
        },
      });
      if (!staff) {
        return res.onError({
          status: 404,
          detail: res.locals.t("auth_user_not_found"),
        });
      }
      const offerStaff = await this.verifyCodesModel.create(
        {
          userId: user.id,
          type: ETypeVerifyCode.OFFER_STAFF,
          expiredDate: moment().add(process.env.MAXAGE_TOKEN_ACTIVE, "hours").toDate(),
          staffId: staff.id,
        },
        {
          transaction: t,
        }
      );
      if (!offerStaff) {
        await t.rollback();
        return res.onError({
          status: 500,
          detail: "common_failed",
        });
      }
      const emailRes = await EmailService.sendResquestStaff(
        staff?.username,
        `${process.env.SITE_URL}/auth/verifyStaff?offerId=${offerStaff.id}`
      );
      if (!emailRes.isSuccess) {
        await t.rollback();
        return res.onError({
          status: 500,
          detail: "email_sending_failed",
        });
      }
      await t.commit();
      return res.onSuccess(
        {},
        {
          message: res.locals.t("common_success"),
        }
      );
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  /**
   * offer staff
   */
  public async cancelSendOffer(offerId: number, res: Response) {
    const t = await sequelize.transaction();
    try {
      const offer = await this.verifyCodesModel.findOne({
        where: {
          id: offerId,
        },
      });
      if (!offer) {
        return res.onError({
          status: 404,
          detail: res.locals.t("common_not_found"),
        });
      }
      await offer.destroy({ transaction: t });
      await t.commit();
      return res.onSuccess(offer, {
        message: res.locals.t("common_cancel_success"),
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  /**
   * accept offer
   */
  public async acceptOffer(offerId: number, user: ModelsAttributes.User, res: Response) {
    const t = await sequelize.transaction();
    try {
      const offer = await this.verifyCodesModel.findOne({
        where: {
          id: offerId,
          staffId: user.id,
        },
      });
      if (!offer) {
        return res.onError({
          status: 404,
          detail: res.locals.t("common_not_found"),
        });
      }
      const staff = await this.usersModel.findOne({
        where: {
          id: user.id,
          isDeleted: false,
        },
      });
      if (!staff) {
        return res.onError({
          status: 404,
          detail: res.locals.t("staff_not_found"),
        });
      }
      staff.becomeStaffDate = new Date();
      staff.enterpriseId = offer.userId;
      staff.role = ETypeUser.STAFF;
      await offer.destroy({ transaction: t });
      await staff.save({ transaction: t });
      await t.commit();
      return res.onSuccess({
        message: res.locals.t("common_success"),
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }
  /**
   * Get all offer
   */
  public async findAllOffers(data: FindAll, user: ModelsAttributes.User, res: Response) {
    try {
      const whereOptions: WhereOptions = {
        userId: user.id,
        type: ETypeVerifyCode.OFFER_STAFF,
      };

      const offset = data.take * (data.page - 1);

      const listOffers = await this.verifyCodesModel.findAndCountAll({
        where: whereOptions,
        include: [
          {
            association: "offers",
          },
        ],
        limit: data.take,
        offset: offset,
        distinct: true,
      });

      return res.onSuccess(listOffers.rows, {
        meta: {
          take: data.take,
          itemCount: listOffers.count,
          page: data.page,
          pageCount: Math.ceil(listOffers.count / data.take),
        },
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  /**
   * Delete staff
   */
  public async delete(staffId: number, user: ModelsAttributes.User, res: Response) {
    try {
      const staff = await this.usersModel.findOne({
        where: {
          id: staffId,
          enterpriseId: user.id,
        },
      });
      if (!staff) {
        return res.onError({
          status: 404,
          detail: res.locals.t("auth_user_not_found"),
        });
      }
      staff.becomeStaffDate = null;
      staff.enterpriseId = null;
      staff.role = ETypeUser.USER;
      await staff.save({ silent: true });
      return res.onSuccess(
        {},
        {
          message: res.locals.t("common_update_success"),
        }
      );
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }
}
