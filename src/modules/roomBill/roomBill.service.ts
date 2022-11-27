import Container, { Inject, Service } from "typedi";
import { ICreateRoomBill, IVerifyBookRoom } from "./roomBill.models";
import { sequelize } from "database/models";
import { Response } from "express";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";
import EmailService from "services/emailService";

@Service()
export default class RoomBillService {
  constructor(
    @Inject("roomBillsModel") private roomBillsModel: ModelsInstance.RoomBills,
    @Inject("roomsModel") private roomsModel: ModelsInstance.Rooms,
    @Inject("roomOtherPricesModel")
    private roomOtherPricesModel: ModelsInstance.RoomOtherPrices,
    @Inject("roomBillDetailsModel") private roomBillDetailsModel: ModelsInstance.RoomBillDetails,
    @Inject("checkRoomsModel") private checkRoomsModel: ModelsInstance.CheckRooms
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
        include: {
          association: "roomBillDetail"
        }
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
   * Get room bill details
   */
   public async getRoomBillDetails(billId: number, res: Response) {
    try {
      const billDetails = await this.roomBillDetailsModel.findAll({
        where: {
          billId: billId,
        },
      });
      if (!billDetails) {
        return res.onError({
          status: 404,
          detail: "not_found",
        });
      }
      const allBillDetails = billDetails.map((item) => {
        return {
          ...item?.dataValues,
        };
      });
      return res.onSuccess(allBillDetails, {
        message: res.locals.t("get_all_room_bill_details_success"),
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  private async handleCalculatePriceForRoom(roomId: number, amount: number, normalDates: string[], specialDates: string[], res: Response) {
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
      const priceInfo = await this.roomOtherPricesModel.findOne({
        where: {
          date: item,
        },
      });
      if (priceInfo) {
        totalPrice += priceInfo?.price;
      }
    });
    const _totalPrice = (totalPrice * (100 - discount)) / 100;
    return {
      roomId: roomId,
      amount: amount,
      discount: discount,
      totalPrice: _totalPrice,
    };
  }

  public async createRoomBill(data: ICreateRoomBill, res: Response) {
    const t = await sequelize.transaction();
    try {
      const codeVerify = uuidv4();
      const newRoomBill = await this.roomBillsModel.create(
        {
          userId: data?.userId,
          hotelId: data?.hotelId,
          startDate: data?.startDate,
          endDate: data?.endDate,
          bookedDates: data?.bookedDates,
          totalBill: data?.totalBill,
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

      const roomBillDetails = <any>[];
      data?.rooms.map(async (room: any) => {
        data?.bookedDates.split(",").map(async(bookedDate)=>{
          roomBillDetails.push(
            this.roomBillDetailsModel.create(
              {
                billId: newRoomBill.id,
                roomId: room.roomId,
                amount: room.amount,
                discount: room.discount,
                price: room.price,
                bookedDate: bookedDate,
                totalPrice: room.totalPrice,
              },
              {
                transaction: t,
              }
            )
          );
        })
      });
      Promise.all(roomBillDetails)
        .then(async (resTemp) => {
          //email
          const emailRes = await EmailService.sendConfirmBookRoom(
            data?.userMail,
            `${process.env.SITE_URL}/book/verifyBookRoom?code=${newRoomBill.verifyCode}&billId=${newRoomBill.id}`
          );
          if (emailRes.isSuccess) {
            await t.commit();
            return res.onSuccess(newRoomBill, {
              message: res.locals.t("room_bill_create_success"),
            });
          } else {
            await t.rollback();
            return res.onError({
              status: 500,
              detail: "email_sending_failed",
            });
          }
        })
        .catch(async (error) => {
          await t.rollback();
          return res.onError({
            status: 500,
            detail: error,
          });
        });
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async verifyBookRoom(data: IVerifyBookRoom, res: Response) {
    const t = await sequelize.transaction();
    try {
      // verify code
      const bill = await this.roomBillsModel.findOne({
        where: {
          id: data.billId,
        },
      });
      if (!bill) {
        return res.onError({
          status: 404,
          detail: res.locals.t("room_bill_not_found"),
        });
      }
      if (!bill.verifyCode) {
        return res.onError({
          status: 404,
          detail: res.locals.t("room_bill_was_verified"),
        });
      }

      if (new Date() < new Date(bill?.expiredDate)) {
        bill.verifyCode = null;
        await bill.save({ transaction: t });

        const roomsOfBill = await this.roomBillDetailsModel.findAll({
          where: {
            billId: bill.id,
          },
        });
        const bookedDates = bill?.bookedDates.split(",");
        let checkRoomReq = <any>[];
        roomsOfBill.forEach((roomItem) => {
          bookedDates.forEach(async (dateItem) => {
            const checkItem = await this.checkRoomsModel.findOne({
              where: {
                bookedDate: dateItem,
                roomId: roomItem?.roomId,
              },
            });
            if (checkItem) {
              checkItem.numberOfRoomsAvailable = checkItem.numberOfRoomsAvailable - roomItem?.amount;
            } else {
              const room = await this.roomsModel.findOne({
                where: {
                  id: roomItem?.roomId,
                },
              });
              checkRoomReq.push(
                this.checkRoomsModel.create({
                  bookedDate: dateItem,
                  roomId: roomItem?.roomId,
                  numberOfRoomsAvailable: room?.numberOfRoom,
                })
              );
            }
          });
        });

        Promise.all(checkRoomReq)
          .then(async () => {
            await t.commit();
            return res.onSuccess({
              detail: res.locals.t("create_check_room_is_successful"),
            });
          })
          .catch(async () => {
            await t.rollback();
            return res.onError({
              status: 400,
              detail: res.locals.t("create_check_room_is_failed"),
            });
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
