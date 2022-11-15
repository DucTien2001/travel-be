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
    private roomOthersModel: ModelsInstance.RoomOtherPrices,
    @Inject("roomBillDetailsModel") private roomBillDetailsModel: ModelsInstance.RoomBillDetails,
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

  private async handleCalculatePriceForRoom(roomId: number, amount: number, normalDates: string[], specialDates: string[], res: Response){
    let totalPrice = 0;
    const room = await this.roomsModel.findOne({
      where: {
        id: roomId,
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
    const discount = room?.discount || 0;

    normalDates.map((item: any) => {
      const date = new Date(item).getDay();
      switch (date) {
        case 0:
          // sunday
          totalPrice += room?.sundayPrice;
          break;
        case 1:
          // monday
          totalPrice += room?.mondayPrice;
          break;
        case 2:
          // tuesday
          totalPrice += room?.tuesdayPrice;
          break;
        case 3:
          // wednesday
          totalPrice += room?.wednesdayPrice;
          break;
        case 4:
          // thursday
          totalPrice += room?.thursdayPrice;
          break;
        case 5:
          // friday
          totalPrice += room?.fridayPrice;
          break;
        default:
          // saturday
          totalPrice += room?.saturdayPrice;
      }
    });
    specialDates.map(async (item) => {
      const priceInfo = await this.roomOthersModel.findOne({
        where: {
          date: item,
        },
      });
      if (priceInfo) {
        totalPrice += priceInfo?.price;
      }
    });
    const _totalPrice = totalPrice*(100-discount)/100
    return {
      roomId: roomId,
      amount: amount,
      discount: discount,
      totalPrice: _totalPrice,
    }
  }

  public async createRoomBill(data: ICreateRoomBill, res: Response) {
    const t = await sequelize.transaction();
    try {
      let totalBill = 0;
      const bookedDates = data?.bookedDates.split(",");
      const specialDates = data?.specialDates.split(",");
      let normalDates = <any>[];
      if (specialDates) {
        bookedDates.map((item) => {
          if (!specialDates.includes(item)) {
            normalDates.push(item);
          }
        });
      } else {
        normalDates = [...bookedDates]
      }

      const billDetails = <any>[]
      data?.rooms.map(async(item)=> {
        const room = await this.roomsModel.findOne({
          where: {
            id: item.roomId,
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
        const billDetail = await this.handleCalculatePriceForRoom(room.id, Number(item.amount), normalDates, specialDates, res)
        totalBill += billDetail.totalPrice
        billDetails.push(billDetail)
      })

      const newRoomBill = await this.roomBillsModel.create(
        {
          userId: data?.userId,
          totalBill: totalBill,
          bookedDates: data?.bookedDates,
          specialDates: data?.specialDates,
          email: data?.email,
          phoneNumber: data?.phoneNumber,
          firstName: data?.firstName,
          lastName: data?.lastName,
        },
        {
          transaction: t,
        }
      );

      billDetails.map(async (item: any)=>{
        const roomBillDetail = await this.roomBillDetailsModel.create(
          {
            billId: newRoomBill.id,
            roomId: item.roomId,
            amount: item.amount,
            discount: item.discount,
            totalPrice: item.totalPrice,
          },
          {
            transaction: t,
          }
        );
        console.log(roomBillDetail, "=======roomBillDetail====")
      })
      await t.commit();
      return res.onSuccess(newRoomBill, {
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
