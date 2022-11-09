import Container, { Inject, Service } from "typedi";
import { ICreateTourBill } from "./tourBill.models";
import { sequelize } from "database/models";
import { Response } from "express";

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
   * Get all tour bill of any tour
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
      const discount = data?.discount || 0;
      const totalBill = (data.amount * data.price * (100 - discount)) / 100;

      const newTour = await this.tourBillsModel.create(
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
        },
        {
          transaction: t,
        }
      );
      await t.commit();
      return res.onSuccess(newTour, {
        message: res.locals.t("tour_bill_create_success"),
      });
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }
}
