/* eslint-disable @typescript-eslint/no-explicit-any */
import { Inject, Service } from "typedi";
import { ESortTourBillOption, StatisticByTour, StatisticByUser, StatisticByTourOnSale, GetAllBillOfOneTourOnSale } from "./tourBill.models";
import { Response } from "express";
import { Op, Order, Sequelize, WhereOptions } from "sequelize";
import { EPaymentStatus } from "models/general";
import { sequelize } from "database/models";

@Service()
export default class TourBillService {
  constructor(
    @Inject("usersModel") private usersModel: ModelsInstance.Users,
    @Inject("toursModel") private toursModel: ModelsInstance.Tours,
    @Inject("tourBillsModel") private tourBillsModel: ModelsInstance.TourBills,
    @Inject("commissionsModel") private commissionsModel: ModelsInstance.Commissions,
    @Inject("tourOnSalesModel") private tourOnSalesModel: ModelsInstance.TourOnSales,
    @Inject("configsModel") private configsModel: ModelsInstance.Configs
  ) {}
  public async statisticByUser(data: StatisticByUser, res: Response) {
    try {
      const offset = data.take * (data.page - 1);

      // get all qualified tourOnSales
      let tourOnSalesWhereOption: WhereOptions = {};
      // ***** Start Search *********
      if (data.keyword) {
        const users = await this.usersModel.findAll({
          attributes: ["id"],
          where: {
            username: { [Op.substring]: data.keyword },
          },
        });
        const userIds = users.map((item) => item.id);
        const tours = await this.toursModel.findAll({
          attributes: ["id"],
          where: {
            owner: userIds,
          },
        });
        const tourIds = tours.map((item) => item.id);
        tourOnSalesWhereOption = {
          ...tourOnSalesWhereOption,
          tourId: tourIds,
        };
      }
      // ***** End Search *********

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
      let order: Order = null;
      if (!isNaN(data?.sort)) {
        switch (data.sort) {
          case ESortTourBillOption.LOWEST_REVENUE:
            order = [[Sequelize.col("revenue"), "ASC"]];
            break;
          case ESortTourBillOption.HIGHEST_REVENUE:
            order = [[Sequelize.col("revenue"), "DESC"]];
            break;
        }
      }
      const tourBills = await this.tourBillsModel.findAndCountAll({
        where: {
          tourOnSaleId: listOnSaleIds,
        },
        include: [
          {
            association: "enterpriseInfo",
            attributes: ["id", "username", "firstName", "lastName", "address", "phoneNumber"],
          },
        ],
        attributes: [
          "tourOwnerId",
          [Sequelize.fn("count", Sequelize.col("tour_bills.id")), "numberOfBookings"],
          [Sequelize.fn("sum", Sequelize.col("amountChild")), "totalAmountChild"],
          [Sequelize.fn("sum", Sequelize.col("amountAdult")), "totalAmountAdult"],
          [Sequelize.fn("sum", Sequelize.col("totalBill")), "revenue"],
          [Sequelize.fn("sum", Sequelize.col("commission")), "commission"],
        ],
        group: "tourOwnerId",
        limit: data.take,
        offset: offset,
        distinct: true,
        order: order,
      });
      if (!tourBills) {
        return res.onError({
          status: 404,
          detail: "not_found",
        });
      }
      return res.onSuccess(tourBills.rows, {
        meta: {
          take: data.take,
          itemCount: Number(tourBills.count),
          page: data.page,
          pageCount: Math.ceil(Number(tourBills.count) / data.take),
        },
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async statisticByTour(enterpriseId: number, data: StatisticByTour, res: Response) {
    try {
      const offset = data.take * (data.page - 1);

      // Get all tours owned
      let listToursWhereOption: WhereOptions = {
        owner: enterpriseId,
        parentLanguage: null,
        isDeleted: false,
      };
      if (data.keyword) {
        listToursWhereOption = {
          [Op.and]: [{ ...listToursWhereOption }, { title: { [Op.substring]: data.keyword } }],
        };
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

  public async statisticByTourOnSale(tourId: number, data: StatisticByTourOnSale, res: Response) {
    try {
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
              tourOnSaleId: item.id,
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

  public async getAllBillOfOneTourOnSale(tourOnSaleId: number, data: GetAllBillOfOneTourOnSale, res: Response) {
    try {
      const offset = data.take * (data.page - 1);
      const bills = await this.tourBillsModel.findAndCountAll({
        where: {
          tourOnSaleId: tourOnSaleId,
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

  public async deleteUnpaidBill() {
    const t = await sequelize.transaction();
    try {
      const bills = await this.tourBillsModel.findAll({
        attributes: ["id", "paymentStatus", "tourOnSaleId", "amountChild", "amountAdult"],
        where: {
          paymentStatus: { [Op.notIn]: [EPaymentStatus.PAID, EPaymentStatus.EXPIRED] },
          expiredTime: {
            [Op.lt]: new Date(),
          },
        },
      });
      const billIds = bills.map((item) => item.id) || [];
      if (billIds.length) {
        const tourOnSales = await this.tourBillsModel.findAll({
          attributes: [
            "tourOnSaleId",
            [Sequelize.fn("sum", Sequelize.col("amountChild")), "totalAmountChild"],
            [Sequelize.fn("sum", Sequelize.col("amountAdult")), "totalAmountAdult"],
          ],
          where: {
            id: billIds,
          },
          include: [
            {
              association: "tourOnSaleInfo",
              attributes: ["quantityOrdered"],
            },
          ],
          group: "tourOnSaleId",
        });
        await Promise.all(
          tourOnSales.map(async (tourOnSale) => {
            return (
              await this.tourOnSalesModel.update(
                {
                  quantityOrdered: tourOnSale.tourOnSaleInfo.quantityOrdered - Number(tourOnSale.dataValues.totalAmountChild) - Number(tourOnSale.dataValues.totalAmountAdult),
                },
                {
                  where: {
                    id: tourOnSale.tourOnSaleId,
                  },
                  transaction: t,
                }
              )
            )
          })
        );

        await this.tourBillsModel.update(
          {
            paymentStatus: EPaymentStatus.EXPIRED,
          },
          {
            where: {
              id: billIds,
            },
            transaction: t,
          }
        );
      }
      // console.log(bills, "=====bills=====")
      await t.commit();
      return 1;
    } catch (error) {
      await t.rollback();
      return 0;
    }
  }
}
