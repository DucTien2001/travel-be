import Container, { Inject, Service } from "typedi";
import { ICreateTourBill, IVerifyBookTour } from "./tourBill.models";
import { sequelize } from "database/models";
import { Response } from "express";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import EmailService from "services/emailService";

@Service()
export default class TourBillService {
  constructor(
    @Inject("tourBillsModel") private tourBillsModel: ModelsInstance.TourBills,
    @Inject("toursModel") private toursModel: ModelsInstance.Tours
  ) {}
  /**
   * Get a tour bill
   */
  public async getTourBill(billId: number, res: Response) {
    try {
      const bill = await this.tourBillsModel.findOne({
        where: {
          id: billId,
        },
      });
      if (!bill) {
        return res.onError({
          status: 404,
          detail: "bill_not_found",
        });
      }
      return res.onSuccess(bill?.dataValues, {
        message: res.locals.t("get_tour_bill_success"),
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  /**
   * Get all tour bills of any tour
   */
  public async getAllTourBills(tourId: number, res: Response) {
    try {
      const bills = await this.tourBillsModel.findAll({
        where: {
          tourId: tourId,
        },
      });
      if (!bills) {
        return res.onError({
          status: 404,
          detail: "not_found",
        });
      }
      const allBills = bills.map((item) => {
        return {
          ...item?.dataValues,
        };
      });
      return res.onSuccess(allBills, {
        message: res.locals.t("get_all_tour_bills_success"),
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  /**
   * Get all tour bills of any user
   */
  public async getAllUserTourBills(userId: number, res: Response) {
    try {
      const bills = await this.tourBillsModel.findAll({
        where: {
          userId: userId,
        },
      });
      if (!bills) {
        return res.onError({
          status: 404,
          detail: "not_found",
        });
      }
      const allBills = bills.map((item) => {
        return {
          ...item?.dataValues,
        };
      });
      return res.onSuccess(allBills, {
        message: res.locals.t("get_all_tour_bills_success"),
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async createTourBill(data: ICreateTourBill, res: Response) {
    const t = await sequelize.transaction();
    try {
      // tour
      const tour = await this.toursModel.findOne({
        where: {
          id: data?.tourId,
          isTemporarilyStopWorking: false,
          isDeleted: false,
        },
      });
      if (!tour) {
        return res.onError({
          status: 404,
          detail: "tour_not_found",
        });
      }

      // tour bill
      const discount = data?.discount || 0;
      const totalBill = (data.amount * data.price * (100 - discount)) / 100;
      const codeVerify = uuidv4()

      const newTourBill = await this.tourBillsModel.create(
        {
          userId: data?.userId,
          tourId: data?.tourId,
          amount: data?.amount,
          price: data?.price,
          discount: data?.discount,
          totalBill: totalBill,
          email: data?.email,
          phoneNumber: data?.phoneNumber,
          firstName: data?.firstName,
          lastName: data?.lastName,
          verifyCode: codeVerify,
          expiredDate: moment().add(process.env.MAXAGE_TOKEN_ACTIVE, "hours").toDate(),
        },
        {
          transaction: t,
        }
      );

      //email
      const emailRes = await EmailService.sendConfirmBookTour(
        data?.userMail,
        `${process.env.SITE_URL}/book/verifyBookTour?code=${newTourBill.verifyCode}&billId=${newTourBill.id}`
      );
      if (emailRes.isSuccess) {
        await t.commit();
        return res.onSuccess(newTourBill, {
          message: res.locals.t("tour_bill_create_success"),
        });
      } else {
        await t.rollback();
        return res.onError({
          status: 500,
          detail: "email_sending_failed",
        });
      }
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }
  
  public async verifyBookTour(data: IVerifyBookTour, res: Response) {
    const t = await sequelize.transaction();
    try {
      // verify code
      const bill = await this.tourBillsModel.findOne({
        where: {
          id: data.billId,
        },
      });
      if (!bill) {
        return res.onError({
          status: 404,
          detail: res.locals.t("tour_bill_not_found"),
        });
      }
      if (!bill.verifyCode) {
        return res.onError({
          status: 404,
          detail: res.locals.t("tour_bill_was_verified"),
        });
      }
      
      if (new Date() < new Date(bill?.expiredDate)) {
        bill.verifyCode = null;
        await bill.save({ transaction: t });
        await t.commit();
        
        return res.onSuccess({
          detail: res.locals.t("complete_verification"),
        });
      } else {
        await t.rollback();
        return res.onError({
          status: 400,
          detail: res.locals.t("the_verification_code_has_expired"),
        });
      }
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }
}
