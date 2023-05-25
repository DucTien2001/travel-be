/* eslint-disable @typescript-eslint/no-explicit-any */
import { Inject, Service } from "typedi";
import { FindAll, StatisticAll, StatisticOneStay, StatisticRoom, Update } from "./roomBill.models";
import { sequelize } from "database/models";
import { Response } from "express";
import { Op, Sequelize, WhereOptions } from "sequelize";
import { EServiceType } from "common/general";
import { EPaymentStatus } from "models/general";

@Service()
export default class TourBillService {
  constructor(
    @Inject("staysModel") private staysModel: ModelsInstance.Stays,
    @Inject("roomsModel") private roomsModel: ModelsInstance.Rooms,
    @Inject("roomBillsModel") private roomBillsModel: ModelsInstance.RoomBills,
    @Inject("commissionsModel") private commissionsModel: ModelsInstance.Commissions,
    @Inject("roomBillDetailsModel") private roomBillDetailsModel: ModelsInstance.RoomBillDetails
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

  public async getFilters(user: ModelsAttributes.User, res: Response) {
    try {
      const enterpriseId = user.enterpriseId || user.id;
      // get stays filter
      const stays = await this.staysModel.findAll({
        attributes: ["id", "name"],
        where: {
          owner: enterpriseId,
          parentLanguage: null,
        },
        include: [
          {
            association: "listRooms",
            attributes: ["id", "title"],
            where: {
              parentLanguage: null,
            },
          },
        ],
      });
      if (!stays) {
        return res.onError({
          status: 404,
          detail: "stay_not_found",
        });
      }

      return res.onSuccess({ stays });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async findAll(data: FindAll, user: ModelsAttributes.User, res: Response) {
    try {
      const enterpriseId = user.enterpriseId || user.id;
      const offset = data.take * (data.page - 1);
      let whereOption: WhereOptions = {
        stayOwnerId: enterpriseId,
        stayId: data.stayId,
      };
      if (data?.roomId) {
        const roomBillDetails = await this.roomBillDetailsModel.findAll({
          attributes: ["id", "billId"],
          where: {
            stayOwnerId: enterpriseId,
            stayId: data.stayId,
            roomId: data.roomId,
          },
          group: "billId",
        });
        const roomBillDetailIds = roomBillDetails.map((item) => item.billId);
        whereOption = {
          ...whereOption,
          id: roomBillDetailIds,
        };
      }
      if (data?.date) {
        whereOption = {
          ...whereOption,
          startDate: {
            [Op.gte]: new Date(data.date),
          },
          endDate: {
            [Op.lt]: new Date(data.date),
          },
        };
      }
      if (data.status !== -1) {
        whereOption = {
          ...whereOption,
          status: data.status,
        };
      }
      const bills = await this.roomBillsModel.findAndCountAll({
        where: whereOption,
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

  public async update(billId: number, data: Update, user: ModelsAttributes.User, res: Response) {
    const t = await sequelize.transaction();
    try {
      const enterpriseId = user.enterpriseId || user.id;
      const roomBill = await this.roomBillsModel.findOne({
        where: {
          id: billId,
          tourOwnerId: enterpriseId,
        },
      });
      if (!roomBill) {
        return res.onError({
          status: 404,
          detail: "Tour bill not found",
        });
      }

      if (data?.status) {
        roomBill.status = data.status;
      }

      await roomBill.save({ transaction: t });
      await t.commit();
      return res.onSuccess(roomBill, {
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

  //
  // Enterprise

  public async statisticAll(data: StatisticAll, user: ModelsAttributes.User, res: Response) {
    try {
      const enterpriseId = user.id;
      const offset = data.take * (data.page - 1);

      // Get all stays owned
      let listStaysWhereOption: WhereOptions = {
        owner: enterpriseId,
        parentLanguage: null,
      };
      if (data.keyword) {
        listStaysWhereOption = {
          [Op.and]: [{ ...listStaysWhereOption }, { name: { [Op.substring]: data.keyword } }],
        };
      }
      const listStays = await this.staysModel.findAndCountAll({
        attributes: ["id", "name", "type"],
        where: listStaysWhereOption,
        limit: data.take,
        offset: offset,
        distinct: true,
      });

      const _listStayIds = listStays.rows.map((item) => item.id);

      // Statistic by roomBillDetail
      let roomBillDetailsWhereOption: WhereOptions = {
        stayId: _listStayIds,
        EPaymentStatus: EPaymentStatus.PAID,
      };
      if (data.month > 0) {
        roomBillDetailsWhereOption = {
          ...roomBillDetailsWhereOption,
          [Op.and]: [
            Sequelize.where(Sequelize.fn("MONTH", Sequelize.col("bookedDate")), data.month as any),
            Sequelize.where(Sequelize.fn("YEAR", Sequelize.col("bookedDate")), data.year as any),
          ],
        };
      }
      const roomBillDetails = await this.roomBillDetailsModel.findAll({
        where: roomBillDetailsWhereOption,
        include: [
          {
            association: "stayInfo",
            attributes: ["id", "name", "type"],
          },
        ],
        attributes: [
          "stayId",
          [Sequelize.literal("COUNT(DISTINCT(billId))"), "numberOfBookings"],
          [Sequelize.fn("sum", Sequelize.col("amount")), "totalNumberOfRoom"],
          [Sequelize.fn("sum", Sequelize.col("price")), "revenue"],
          [Sequelize.fn("sum", Sequelize.col("commission")), "commission"],
        ],
        group: "stayId",
      });

      const validStayIds = roomBillDetails.map((item) => item.stayId);

      let result: any = [...roomBillDetails];
      listStays.rows.forEach((item) => {
        if (!validStayIds.includes(item.id)) {
          result = [
            ...result,
            {
              stayId: item.id,
              numberOfBookings: 0,
              revenue: 0,
              commission: 0,
              stayInfo: item,
            },
          ];
        }
      });
      result = result.sort((a: any, b: any) => a.stayId - b.stayId);
      return res.onSuccess(result, {
        meta: {
          take: data.take,
          itemCount: listStays.count,
          page: data.page,
          pageCount: Math.ceil(listStays.count / data.take),
        },
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async statisticOneStay(stayId: number, data: StatisticOneStay, user: ModelsAttributes.User, res: Response) {
    try {
      const enterpriseId = user.id;

      // Check stay owner
      const stay = await this.staysModel.findOne({
        where: {
          id: stayId,
          parentLanguage: null,
          owner: enterpriseId,
        },
      });
      if (!stay) {
        return res.onError({
          status: 404,
          detail: "Stay not found",
        });
      }

      // Get all rooms of the stay
      const offset = data.take * (data.page - 1);
      const listRooms = await this.roomsModel.findAndCountAll({
        attributes: ["id", "title", "numberOfBed", "numberOfRoom", "numberOfAdult", "numberOfChildren"],
        where: {
          stayId: stayId,
          parentLanguage: null,
        },
        limit: data.take,
        offset: offset,
        distinct: true,
      });
      const _listRoomIds = listRooms.rows.map((item) => item.id);

      // Statistic by roomBillDetail
      let roomBillDetailsWhereOption: WhereOptions = {
        roomId: _listRoomIds,
        EPaymentStatus: EPaymentStatus.PAID,
      };
      if (data.month > 0) {
        roomBillDetailsWhereOption = {
          ...roomBillDetailsWhereOption,
          [Op.and]: [
            Sequelize.where(Sequelize.fn("MONTH", Sequelize.col("bookedDate")), data.month as any),
            Sequelize.where(Sequelize.fn("YEAR", Sequelize.col("bookedDate")), data.year as any),
          ],
        };
      }
      const roomBillDetails = await this.roomBillDetailsModel.findAll({
        where: roomBillDetailsWhereOption,
        include: [
          {
            association: "roomInfo",
            attributes: ["id", "title", "numberOfBed", "numberOfRoom", "numberOfAdult", "numberOfChildren"],
          },
        ],
        attributes: [
          "roomId",
          [Sequelize.literal("COUNT(DISTINCT(billId))"), "numberOfBookings"],
          [Sequelize.fn("sum", Sequelize.col("amount")), "totalNumberOfRoom"],
          [Sequelize.fn("sum", Sequelize.col("price")), "revenue"],
          [Sequelize.fn("sum", Sequelize.col("commission")), "commission"],
        ],
        group: "roomId",
      });

      const validRoomIds = roomBillDetails.map((item) => item.stayId);

      let result: any = [...roomBillDetails];
      listRooms.rows.forEach((item) => {
        if (!validRoomIds.includes(item.id)) {
          result = [
            ...result,
            {
              roomId: item.id,
              numberOfBookings: 0,
              revenue: 0,
              commission: 0,
              roomInfo: item,
            },
          ];
        }
      });
      result = result.sort((a: any, b: any) => a.roomId - b.roomId);

      return res.onSuccess(result, {
        meta: {
          take: data.take,
          itemCount: listRooms.count,
          page: data.page,
          pageCount: Math.ceil(listRooms.count / data.take),
        },
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async statisticOneRoom(roomId: number, data: StatisticRoom, user: ModelsAttributes.User, res: Response) {
    try {
      const enterpriseId = user.id;
      const offset = data.take * (data.page - 1);

      // Statistic by roomBillDetail
      let roomBillDetailsWhereOption: WhereOptions = {
        roomId: roomId,
        EPaymentStatus: EPaymentStatus.PAID,
        stayOwnerId: enterpriseId,
      };
      if (data.month > 0) {
        roomBillDetailsWhereOption = {
          ...roomBillDetailsWhereOption,
          [Op.and]: [
            Sequelize.where(Sequelize.fn("MONTH", Sequelize.col("bookedDate")), data.month as any),
            Sequelize.where(Sequelize.fn("YEAR", Sequelize.col("bookedDate")), data.year as any),
          ],
        };
      }
      const roomBillDetails = await this.roomBillDetailsModel.findAndCountAll({
        where: roomBillDetailsWhereOption,
        attributes: [
          "bookedDate",
          [Sequelize.literal("COUNT(DISTINCT(billId))"), "numberOfBookings"],
          [Sequelize.fn("sum", Sequelize.col("amount")), "totalNumberOfRoom"],
          [Sequelize.fn("sum", Sequelize.col("price")), "revenue"],
          [Sequelize.fn("sum", Sequelize.col("commission")), "commission"],
        ],
        group: "bookedDate",
        limit: data.take,
        offset: offset,
        distinct: true,
      });

      return res.onSuccess(roomBillDetails.rows, {
        meta: {
          take: data.take,
          itemCount: roomBillDetails.count,
          page: data.page,
          pageCount: Math.ceil(roomBillDetails.count / data.take),
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
