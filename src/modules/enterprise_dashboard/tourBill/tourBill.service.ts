/* eslint-disable @typescript-eslint/no-explicit-any */
import { Inject, Service } from "typedi";
import { FindAll, StatisticAll, StatisticOneTour, Update } from "./tourBill.models";
import { sequelize } from "database/models";
import { Response } from "express";
import { Op, Sequelize, WhereOptions } from "sequelize";
import { EServiceType } from "common/general";

@Service()
export default class TourBillService {
  constructor(
    @Inject("toursModel") private toursModel: ModelsInstance.Tours,
    @Inject("tourBillsModel") private tourBillsModel: ModelsInstance.TourBills,
    @Inject("commissionsModel") private commissionsModel: ModelsInstance.Commissions,
    @Inject("tourOnSalesModel") private tourOnSalesModel: ModelsInstance.TourOnSales
  ) {}
  public async getCommissionRate(price: number) {
    const commissions = await this.commissionsModel.findAll({
      where: {
        serviceType: EServiceType.TOUR,
      },
    });
    let rate = 0;
    commissions.forEach((item) => {
      if (!item.maxPrice && price >= item.minPrice) {
        rate = item.rate;
      } else if (price >= item.minPrice && price < item.maxPrice) {
        rate = item.rate;
      }
    });
    return rate;
  }

  public async findAll(data: FindAll, user: ModelsAttributes.User, res: Response) {
    try {
      const enterpriseId = user.enterpriseId || user.id;
      const offset = data.take * (data.page - 1);
      const bills = await this.tourBillsModel.findAndCountAll({
        where: {
          tourOwnerId: enterpriseId,
        },
        limit: data.take,
        offset: offset,
        distinct: true,
      });
      if (!bills) {
        return res.onError({
          status: 404,
          detail: "not_found",
        });
      }

      // ====== Handle expiredDate =====
      // const allBills: any[] = [];
      // bills.rows.map((item) => {
      //   if (new Date().getTime() < new Date(item?.expiredDate).getTime()) {
      //     allBills.push({
      //       ...item?.dataValues,
      //     });
      //   }
      // });
      return res.onSuccess(bills.rows, {
        meta: {
          take: data.take,
          itemCount: bills.count,
          page: data.page,
          pageCount: Math.ceil(bills.count / data.take),
        },
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async findOne(billId: number, user: ModelsAttributes.User, res: Response) {
    try {
      const enterpriseId = user.enterpriseId || user.id;
      const bill = await this.tourBillsModel.findOne({
        where: {
          id: billId,
          tourOwnerId: enterpriseId,
        },
      });
      if (!bill) {
        return res.onError({
          status: 404,
          detail: "bill_not_found",
        });
      }
      return res.onSuccess(bill, {
        message: res.locals.t("get_tour_bill_success"),
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async update(billId: number, data: Update, user: ModelsAttributes.User, res: Response) {
    const t = await sequelize.transaction();
    try {
      const enterpriseId = user.enterpriseId || user.id;
      const tourBill = await this.tourBillsModel.findOne({
        where: {
          id: billId,
          tourOwnerId: enterpriseId,
        },
      });
      if (!tourBill) {
        return res.onError({
          status: 404,
          detail: "Tour bill not found",
        });
      }

      if (data?.status) {
        tourBill.status = data.status;
      }

      await tourBill.save({ transaction: t });
      await t.commit();
      return res.onSuccess(tourBill, {
        message: res.locals.t("tour_bill_update_success"),
      });
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async statisticAll(data: StatisticAll, user: ModelsAttributes.User, res: Response) {
    try {
      const enterpriseId = user.id;
      const offset = data.take * (data.page - 1);

      // Get all tours owned
      let listToursWhereOption: WhereOptions = {
        owner: enterpriseId,
        parentLanguage: null,
        isDeleted: false,
      };
      if (data.keyword) {
        listToursWhereOption = {
          [Op.and]: [
            { ...listToursWhereOption },
            { title: { [Op.substring]: data.keyword } }
          ]
        }
      }
      const listTours = await this.toursModel.findAndCountAll({
        attributes: ["id", "title", "numberOfDays", "numberOfNights"],
        where: listToursWhereOption,
        limit: data.take,
        offset: offset,
        distinct: true,
      });

      const _listTourIds = listTours.rows.map((item) => item.id);

      // get all qualified tourOnSales
      let tourOnSalesWhereOption: WhereOptions = {
        tourId: _listTourIds,
      };
      if (data.month > 0) {
        tourOnSalesWhereOption = {
          ...tourOnSalesWhereOption,
          [Op.and]: [
            Sequelize.where(Sequelize.fn("MONTH", Sequelize.col("startDate")), data.month as any),
            Sequelize.where(Sequelize.fn("YEAR", Sequelize.col("startDate")), data.year as any),
          ],
        };
      }
      const tourOnSales = await this.tourOnSalesModel.findAll({
        attributes: ["id"],
        where: tourOnSalesWhereOption,
      });
      const listOnSaleIds = tourOnSales.map((item) => item.id);

      // get all qualified tourBills
      // let tourBillsWhereOption: WhereOptions = {
      //   tourOnSaleId: listOnSaleIds,
      // };
      // if (data.month > 0) {
      //   tourBillsWhereOption = {
      //     ...tourBillsWhereOption,
      //     [Op.and]: [
      //       Sequelize.where(Sequelize.fn("MONTH", Sequelize.col("tour_bills.createdAt")), data.month as any),
      //       Sequelize.where(Sequelize.fn("YEAR", Sequelize.col("tour_bills.createdAt")), data.year as any),
      //     ],
      //   };
      // }
      const tourBills = await this.tourBillsModel.findAll({
        where: {
          tourOnSaleId: listOnSaleIds,
        },
        include: [
          {
            association: "tourInfo",
            attributes: ["id", "title", "numberOfDays", "numberOfNights"],
          },
        ],
        attributes: [
          "tourId",
          [Sequelize.fn("count", Sequelize.col("tour_bills.id")), "numberOfBookings"],
          [Sequelize.fn("sum", Sequelize.col("amountChild")), "totalAmountChild"],
          [Sequelize.fn("sum", Sequelize.col("amountAdult")), "totalAmountAdult"],
          [Sequelize.fn("sum", Sequelize.col("totalBill")), "revenue"],
          [Sequelize.fn("sum", Sequelize.col("commission")), "commission"],
        ],
        group: "tourId",
      });
      if (!tourBills) {
        return res.onError({
          status: 404,
          detail: "not_found",
        });
      }
      const _tourBillIds = tourBills.map((item) => item.tourId);
      let result: any = [...tourBills];
      listTours.rows.forEach((item) => {
        if (!_tourBillIds.includes(item.id)) {
          result = [
            ...result,
            {
              tourId: item.id,
              numberOfBookings: 0,
              totalAmountChild: 0,
              totalAmountAdult: 0,
              revenue: 0,
              commission: 0,
              tourInfo: item,
            },
          ];
        }
      });
      result = result.sort((a: any, b: any) => a.tourId - b.tourId);
      return res.onSuccess(result, {
        meta: {
          take: data.take,
          itemCount: listTours.count,
          page: data.page,
          pageCount: Math.ceil(listTours.count / data.take),
        },
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async statisticOneTour(tourId: number, data: StatisticOneTour, user: ModelsAttributes.User, res: Response) {
    try {
      const enterpriseId = user.id;

      // Check tour owner
      const tour = await this.toursModel.findOne({
        where: {
          id: tourId,
          parentLanguage: null,
          isDeleted: false,
          owner: enterpriseId,
        },
      });
      if (!tour) {
        return res.onError({
          status: 404,
          detail: "Tour not found",
        });
      }
      
      // Get all tour on sales of the tour
      const offset = data.take * (data.page - 1);
      let listTourOnSalesWhereOption: WhereOptions = {
        tourId: tourId,
        isDeleted: false,
      };
      if (data.month > 0) {
        listTourOnSalesWhereOption = {
          ...listTourOnSalesWhereOption,
          [Op.and]: [
            Sequelize.where(Sequelize.fn("MONTH", Sequelize.col("startDate")), data.month as any),
            Sequelize.where(Sequelize.fn("YEAR", Sequelize.col("startDate")), data.year as any),
          ],
        };
      }
      const listTourOnSales = await this.tourOnSalesModel.findAndCountAll({
        attributes: ["id", "startDate", "quantity", "quantityOrdered"],
        where: listTourOnSalesWhereOption,
        limit: data.take,
        offset: offset,
        distinct: true,
      });

      const _listTourOnSaleIds = listTourOnSales.rows.map((item) => item.id);

      // Get all qualified tourBills
      const whereOption: WhereOptions = {
        tourOnSaleId: _listTourOnSaleIds,
      };
      const tourBills = await this.tourBillsModel.findAll({
        where: whereOption,
        include: [
          {
            association: "tourOnSaleInfo",
            attributes: ["id", "startDate", "quantity", "quantityOrdered"],
          },
        ],
        attributes: [
          "tourOnSaleId",
          [Sequelize.fn("count", Sequelize.col("tour_bills.id")), "numberOfBookings"],
          [Sequelize.fn("sum", Sequelize.col("amountChild")), "totalAmountChild"],
          [Sequelize.fn("sum", Sequelize.col("amountAdult")), "totalAmountAdult"],
          [Sequelize.fn("sum", Sequelize.col("totalBill")), "revenue"],
          [Sequelize.fn("sum", Sequelize.col("commission")), "commission"],
        ],
        group: "tourOnSaleId",
      });
      if (!tourBills) {
        return res.onError({
          status: 404,
          detail: "not_found",
        });
      }
      
      const _tourBillIds = tourBills.map((item) => item.tourOnSaleId);
      let result: any = [...tourBills];
      listTourOnSales.rows.forEach((item) => {
        if (!_tourBillIds.includes(item.id)) {
          result = [
            ...result,
            {
              tourId: item.id,
              numberOfBookings: 0,
              totalAmountChild: 0,
              totalAmountAdult: 0,
              revenue: 0,
              commission: 0,
              tourOnSaleInfo: item,
            },
          ];
        }
      });
      result = result.sort((a: any, b: any) => a.tourId - b.tourId);

      return res.onSuccess(result, {
        meta: {
          take: data.take,
          itemCount: listTourOnSales.count,
          page: data.page,
          pageCount: Math.ceil(listTourOnSales.count / data.take),
        },
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async getAllBillOfOneTourOnSale(tourOnSaleId: number, data: FindAll, user: ModelsAttributes.User, res: Response) {
    try {
      const enterpriseId = user.id;
      const offset = data.take * (data.page - 1);
      const bills = await this.tourBillsModel.findAndCountAll({
        where: {
          tourOnSaleId: tourOnSaleId,
          tourOwnerId: enterpriseId,
        },
        limit: data.take,
        offset: offset,
        distinct: true,
      });
      if (!bills) {
        return res.onError({
          status: 404,
          detail: "not_found",
        });
      }

      return res.onSuccess(bills.rows, {
        meta: {
          take: data.take,
          itemCount: bills.count,
          page: data.page,
          pageCount: Math.ceil(bills.count / data.take),
        },
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }
}
