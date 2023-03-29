import Container, { Inject, Service } from "typedi";
import {
  ICreateTourBill,
  IGetAllTourBillsAnyDate,
  IGetToursRevenueByMonth,
  IGetToursRevenueByYear,
  IVerifyBookTour,
} from "./tourBill.models";
import { sequelize } from "database/models";
import { Response } from "express";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import EmailService from "services/emailService";
import { Op } from "sequelize";
import { TourBillAttributes } from "database/models/tourBills";

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
        include: {
          association: "userInfo",
        },
      });
      if (!bills) {
        return res.onError({
          status: 404,
          detail: "not_found",
        });
      }
      const allBills: any[] = [];
      bills.map((item) => {
        if (!item?.verifyCode || new Date().getTime() < new Date(item?.expiredDate).getTime()) {
          allBills.push({
            ...item?.dataValues,
          });
        }
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
        include: {
          association: "tourInfo",
        },
      });
      if (!bills) {
        return res.onError({
          status: 404,
          detail: "not_found",
        });
      }
      const allBills: any[] = [];
      bills.map((item) => {
        if (!item?.verifyCode || new Date().getTime() < new Date(item?.expiredDate).getTime()) {
          allBills.push({
            ...item?.dataValues,
          });
        }
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
   * Get all tour bills of any date
   */
  public async getAllTourBillsAnyDate(data: IGetAllTourBillsAnyDate, res: Response) {
    try {
      const listTourBills = await this.tourBillsModel.findAll({
        where: {
          tourId: {
            [Op.or]: data.tourIds,
          },
        },
        include: {
          association: "tourInfo",
        },
      });
      if (!listTourBills) {
        return res.onError({
          status: 404,
          detail: "Not found",
        });
      }
      const allBills: any[] = [];
      const dateRequest = new Date(data.date);
      const date = dateRequest.getDate();
      const month = dateRequest.getMonth();
      const year = dateRequest.getFullYear();
      listTourBills.map((item) => {
        const dateCreated = new Date(item?.createdAt);
        const createDate = dateCreated.getDate();
        const createMonth = dateCreated.getMonth();
        const createYear = dateCreated.getFullYear();
        if (date === createDate && month === createMonth && year === createYear) {
          allBills.push({
            ...item?.dataValues,
          });
        }
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
      // const codeVerify = uuidv4();

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
          bankName: data?.bankName,
          bankAccountName: data?.bankAccountName,
          bankNumber: data?.bankNumber,
          accountExpirationDate: data?.accountExpirationDate,
          deposit: data?.deposit,
          verifyCode: null,
          expiredDate: moment().add(process.env.MAXAGE_TOKEN_ACTIVE, "hours").toDate(),
        },
        {
          transaction: t,
        }
      );

      await t.commit();
      return res.onSuccess(newTourBill, {
        message: res.locals.t("tour_bill_create_success"),
      });
      //email
      // const emailRes = await EmailService.sendConfirmBookTour(
      //   data?.userMail,
      //   `${process.env.SITE_URL}/book/verifyBookTour?code=${newTourBill.verifyCode}&billId=${newTourBill.id}`
      // );
      // if (emailRes.isSuccess) {
      //   await t.commit();
      //   return res.onSuccess(newTourBill, {
      //     message: res.locals.t("tour_bill_create_success"),
      //   });
      // } else {
      //   await t.rollback();
      //   return res.onError({
      //     status: 500,
      //     detail: "email_sending_failed",
      //   });
      // }
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

  /**
   * Cancel tour bill
   */
  public async cancelTourBill(billId: number, res: Response) {
    const t = await sequelize.transaction();
    try {
      await this.tourBillsModel.destroy({
        where: {
          id: billId,
        },
      });
      await t.commit();
      return res.onSuccess("Cancel successfully", {
        message: res.locals.t("Cancel successfully"),
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  /**
   * Get all tours revenue by month
   */
  public async getRevenueOfToursByMonth(data: IGetToursRevenueByMonth, res: Response) {
    try {
      const bills = await this.tourBillsModel.findAll({
        where: {
          tourId: {
            [Op.or]: data.tourIds,
          },
          verifyCode: null,
        },
      });
      if (!bills) {
        return res.onError({
          status: 404,
          detail: "not_found",
        });
      }
      const tourBillArr: TourBillAttributes[][] = [];
      data.tourIds.forEach((tourId) => {
        tourBillArr.push(
          bills.filter(
            (bill) =>
              bill?.dataValues?.tourId === tourId &&
              new Date(bill?.dataValues?.createdAt).getMonth() === data.month &&
              new Date(bill?.dataValues?.createdAt).getFullYear() === data.year
          )
        );
      });
      const tourBillDetailArr: any[][] = [];
      tourBillArr.forEach((tourBills) => {
        const tourBillDetail: any[] = [];
        tourBills.forEach((billItem) => {
          const date = new Date(billItem?.dataValues?.createdAt).getDate();
          let isNotHaveDate = true;
          tourBillDetail.forEach((detailItem) => {
            if (detailItem?.date === date) {
              isNotHaveDate = false;
              detailItem!.cost += billItem?.dataValues?.totalBill;
            }
          });
          if (isNotHaveDate) {
            tourBillDetail.push({
              date: date,
              cost: billItem?.dataValues?.totalBill,
            });
          }
        });
        tourBillDetailArr.push(tourBillDetail);
      });
      return res.onSuccess(tourBillDetailArr, {
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
   * Get all tours revenue by year
   */
  public async getRevenueOfToursByYear(data: IGetToursRevenueByYear, res: Response) {
    try {
      const bills = await this.tourBillsModel.findAll({
        where: {
          tourId: {
            [Op.or]: data.tourIds,
          },
          verifyCode: null,
        },
      });
      if (!bills) {
        return res.onError({
          status: 404,
          detail: "not_found",
        });
      }
      const tourBillArr: TourBillAttributes[][] = [];
      data.tourIds.forEach((tourId) => {
        tourBillArr.push(
          bills.filter((bill) => bill?.dataValues?.tourId === tourId && new Date(bill?.dataValues?.createdAt).getFullYear() === data.year)
        );
      });
      const tourBillDetailArr: any[][] = [];
      tourBillArr.forEach((tourBills) => {
        const tourBillDetail: any[] = [];
        tourBills.forEach((billItem) => {
          const month = new Date(billItem?.dataValues?.createdAt).getMonth();
          let isNotHaveMonth = true;
          tourBillDetail.forEach((detailItem) => {
            if (detailItem?.month === month) {
              isNotHaveMonth = false;
              detailItem!.cost += billItem?.dataValues?.totalBill;
            }
          });
          if (isNotHaveMonth) {
            tourBillDetail.push({
              month: month,
              cost: billItem?.dataValues?.totalBill,
            });
          }
        });
        tourBillDetailArr.push(tourBillDetail);
      });
      return res.onSuccess(tourBillDetailArr, {
        message: res.locals.t("get_all_tour_bills_success"),
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }
}