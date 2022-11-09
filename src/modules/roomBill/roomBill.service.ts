import Container, { Inject, Service } from "typedi";
import { ICreateRoomBill } from "./roomBill.models";
import { sequelize } from "database/models";
import { Response } from "express";

@Service()
export default class RoomBillService {
  constructor(
    @Inject("roomBillsModel") private roomBillsModel: ModelsInstance.RoomBills,
    @Inject("roomsModel") private roomsModel: ModelsInstance.Rooms,
    @Inject("roomOthersModel")
    private roomOthersModel: ModelsInstance.RoomOtherPrices
  ) {}
  /**
   * Get a room bill
   */
  public async getRoomBill(billId: number, res: Response) {
    try {
      const bill = await this.roomBillsModel.findOne({
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
        message: res.locals.t("get_room_bill_success"),
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  /**
   * Get all room bill of any room
   */
  public async getAllRoomBills(roomId: number, res: Response) {
    try {
      const bills = await this.roomBillsModel.findAll({
        where: {
          roomId: roomId,
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
        message: res.locals.t("get_all_room_bills_success"),
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  /**
   * Get all room bills of any user
   */
  public async getAllUserRoomBills(userId: number, res: Response) {
    try {
      const bills = await this.roomBillsModel.findAll({
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
        message: res.locals.t("get_all_room_bills_success"),
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async createRoomBill(data: ICreateRoomBill, res: Response) {
    const t = await sequelize.transaction();
    try {
      const room = await this.roomsModel.findOne({
        where: {
          id: data?.roomId,
          isTemporarilyStopWorking: false,
          isDeleted: false,
        },
      });
      if (!room) {
        return res.onError({
          status: 404,
          detail: "room_not_found",
        });
      }
      const discount = data?.discount || 0;
      let totalBill = 0;
      const bookedDates = data?.bookedDates.split(",");
      const specialDates = data?.specialDates.split(",");
      const normalDates = <any>[];
      if (specialDates) {
        bookedDates.map((item) => {
          if (!specialDates.includes(item)) {
            normalDates.push(item);
          }
        });
        specialDates.map(async (item) => {
          const priceInfo = await this.roomOthersModel.findOne({
            where: {
              date: item,
            },
          });
          if (priceInfo) {
            totalBill += priceInfo?.price;
          }
        });
      }
      normalDates.map((item: any) => {
        const date = new Date(item).getDay();
        switch (date) {
          case 0:
            // sunday
            totalBill += room?.sundayPrice;
            break;
          case 1:
            // monday
            totalBill += room?.mondayPrice;
            break;
          case 2:
            // tuesday
            totalBill += room?.tuesdayPrice;
            break;
          case 3:
            // wednesday
            totalBill += room?.wednesdayPrice;
            break;
          case 4:
            // thursday
            totalBill += room?.thursdayPrice;
            break;
          case 5:
            // friday
            totalBill += room?.fridayPrice;
            break;
          default:
            // saturday
            totalBill += room?.saturdayPrice;
        }
      });

      const newRoom = await this.roomBillsModel.create(
        {
          userId: data?.userId,
          roomId: data?.roomId,
          amount: data?.amount,
          discount: data?.discount,
          totalBill: (totalBill * (100 - discount)) / 100,
          bookedDates: data?.bookedDates,
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
      return res.onSuccess(newRoom, {
        message: res.locals.t("room_bill_create_success"),
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
