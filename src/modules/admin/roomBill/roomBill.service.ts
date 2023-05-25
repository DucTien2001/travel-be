/* eslint-disable @typescript-eslint/no-explicit-any */
import { Inject, Service } from "typedi";
import { ESortRoomBillOption, StatisticOneUser, StatisticAllUsers, StatisticOneStay, StatisticRoom } from "./roomBill.models";
import { Response } from "express";
import { Op, Order, Sequelize, WhereOptions } from "sequelize";
import { EPaymentStatus } from "models/general";

@Service()
export default class TourBillService {
  constructor(
    @Inject("usersModel") private usersModel: ModelsInstance.Users,
    @Inject("staysModel") private staysModel: ModelsInstance.Stays,
    @Inject("roomsModel") private roomsModel: ModelsInstance.Rooms,
    @Inject("roomBillDetailsModel") private roomBillDetailsModel: ModelsInstance.RoomBillDetails
  ) {}
  public async statisticAllUsers(data: StatisticAllUsers, res: Response) {
    try {
      const offset = data.take * (data.page - 1);
      let order: Order = null;
      if (!isNaN(data?.sort)) {
        switch (data.sort) {
          case ESortRoomBillOption.LOWEST_REVENUE:
            order = [[Sequelize.col("revenue"), "ASC"]];
            break;
          case ESortRoomBillOption.HIGHEST_REVENUE:
            order = [[Sequelize.col("revenue"), "DESC"]];
            break;
        }
      }

      let usersWhereOption: WhereOptions = {};
      // ***** Start Search *********
      if (data.keyword) {
        usersWhereOption = {
          ...usersWhereOption,
          username: { [Op.substring]: data.keyword },
        }
      }
      // ***** End Search *********

      // get all qualified tourOnSales
      let roomBillDetailsWhereOption: WhereOptions = {
        paymentStatus: EPaymentStatus.PAID
      };
      if (data.month > 0) {
        roomBillDetailsWhereOption = {
          ...roomBillDetailsWhereOption,
          [Op.and]: [
            Sequelize.where(Sequelize.fn("MONTH", Sequelize.col("startDate")), data.month as any),
            Sequelize.where(Sequelize.fn("YEAR", Sequelize.col("startDate")), data.year as any),
          ],
        };
      }
      
      const statisticUsers = await this.usersModel.findAndCountAll({
        where: usersWhereOption,
        include: [
          {
            association: "listRoomBillDetails",
            where: roomBillDetailsWhereOption,
            attributes: [
              "stayOwnerId",
              [Sequelize.literal("COUNT(DISTINCT(billId))"), "numberOfBookings"],
              [Sequelize.fn("sum", Sequelize.col("amount")), "totalNumberOfRoom"],
              [Sequelize.fn("sum", Sequelize.col("totalBill")), "revenue"],
              [Sequelize.fn("sum", Sequelize.col("commission")), "commission"],
            ],
          }
        ],
        group: "users.id",
        limit: data.take,
        offset: offset,
        distinct: true,
        order: order,
      })
      if (!statisticUsers) {
        return res.onError({
          status: 404,
          detail: "not_found",
        });
      }
      return res.onSuccess(statisticUsers.rows, {
        meta: {
          take: data.take,
          itemCount: Number(statisticUsers.count),
          page: data.page,
          pageCount: Math.ceil(Number(statisticUsers.count) / data.take),
        },
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async getFiltersForStayOfUser(enterpriseId: number, res: Response) {
    try {
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

  public async statisticOneUser(enterpriseId: number, data: StatisticOneUser, res: Response) {
    try {
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
        paymentStatus: EPaymentStatus.PAID,
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

  public async statisticOneStay(stayId: number, data: StatisticOneStay, res: Response) {
    try {
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
        paymentStatus: EPaymentStatus.PAID,
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

  public async statisticOneRoom(roomId: number, data: StatisticRoom, res: Response) {
    try {
      // Statistic by roomBillDetail
      let roomBillDetailsWhereOption: WhereOptions = {
        roomId: roomId,
        paymentStatus: EPaymentStatus.PAID,
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
        attributes: [
          "bookedDate",
          [Sequelize.literal("COUNT(DISTINCT(billId))"), "numberOfBookings"],
          [Sequelize.fn("sum", Sequelize.col("amount")), "totalNumberOfRoom"],
          [Sequelize.fn("sum", Sequelize.col("price")), "revenue"],
          [Sequelize.fn("sum", Sequelize.col("commission")), "commission"],
        ],
        group: "bookedDate",
      });

      return res.onSuccess(roomBillDetails);
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }
  
  // public async statisticAllUsersOld(data: StatisticAllUsers, res: Response) {
  //   try {
  //     const offset = data.take * (data.page - 1);

  //     // get all qualified tourOnSales
  //     let roomBillDetailsWhereOption: WhereOptions = {
  //       paymentStatus: EPaymentStatus.PAID
  //     };
  //     // ***** Start Search *********
  //     if (data.keyword) {
  //       const users = await this.usersModel.findAll({
  //         attributes: ["id"],
  //         where: {
  //           username: { [Op.substring]: data.keyword },
  //         },
  //       });
  //       const userIds = users.map((item) => item.id);

  //       roomBillDetailsWhereOption = {
  //         ...roomBillDetailsWhereOption,
  //         stayOwnerId: userIds,
  //       };
  //     }
  //     // ***** End Search *********

  //     if (data.month > 0) {
  //       roomBillDetailsWhereOption = {
  //         ...roomBillDetailsWhereOption,
  //         [Op.and]: [
  //           Sequelize.where(Sequelize.fn("MONTH", Sequelize.col("startDate")), data.month as any),
  //           Sequelize.where(Sequelize.fn("YEAR", Sequelize.col("startDate")), data.year as any),
  //         ],
  //       };
  //     }

  //     // get all qualified tourBills
  //     let order: Order = null;
  //     if (!isNaN(data?.sort)) {
  //       switch (data.sort) {
  //         case ESortRoomBillOption.LOWEST_REVENUE:
  //           order = [[Sequelize.col("revenue"), "ASC"]];
  //           break;
  //         case ESortRoomBillOption.HIGHEST_REVENUE:
  //           order = [[Sequelize.col("revenue"), "DESC"]];
  //           break;
  //       }
  //     }
  //     const roomBillDetails = await this.roomBillDetailsModel.findAndCountAll({
  //       where: roomBillDetailsWhereOption,
  //       include: [
  //         {
  //           association: "enterpriseInfo",
  //           attributes: ["id", "username", "firstName", "lastName", "address", "phoneNumber"],
  //         },
  //       ],
  //       attributes: [
  //         "stayOwnerId",
  //         [Sequelize.literal("COUNT(DISTINCT(billId))"), "numberOfBookings"],
  //         [Sequelize.fn("sum", Sequelize.col("amount")), "totalNumberOfRoom"],
  //         [Sequelize.fn("sum", Sequelize.col("totalBill")), "revenue"],
  //         [Sequelize.fn("sum", Sequelize.col("commission")), "commission"],
  //       ],
  //       group: "stayOwnerId",
  //       limit: data.take,
  //       offset: offset,
  //       distinct: true,
  //       order: order,
  //     });
  //     if (!roomBillDetails) {
  //       return res.onError({
  //         status: 404,
  //         detail: "not_found",
  //       });
  //     }
  //     return res.onSuccess(roomBillDetails.rows, {
  //       meta: {
  //         take: data.take,
  //         itemCount: Number(roomBillDetails.count),
  //         page: data.page,
  //         pageCount: Math.ceil(Number(roomBillDetails.count) / data.take),
  //       },
  //     });
  //   } catch (error) {
  //     return res.onError({
  //       status: 500,
  //       detail: error,
  //     });
  //   }
  // }
}
