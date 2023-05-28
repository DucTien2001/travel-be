/* eslint-disable @typescript-eslint/no-explicit-any */
import Container, { Inject, Service } from "typedi";
import {
  Create,
  FindAll,
  ICreateRoomBill,
  IGetBillsAnyRoom,
  IGetHotelsRevenueByMonth,
  IGetHotelsRevenueByYear,
  IVerifyBookRoom,
  Update,
} from "./roomBill.models";
import { sequelize } from "database/models";
import { Response } from "express";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";
import EmailService from "services/emailService";
import { Op } from "sequelize";
import { RoomBillAttributes } from "database/models/roomBills";
import { EServiceType } from "common/general";
import { EBillStatus, EPaymentStatus } from "models/general";
import { CheckoutPayload } from "../tourBill/tourBill.models";
import querystring from "qs";
import crypto from "crypto";

@Service()
export default class RoomBillService {
  constructor(
    @Inject("staysModel") private staysModel: ModelsInstance.Stays,
    @Inject("roomBillsModel") private roomBillsModel: ModelsInstance.RoomBills,
    @Inject("roomsModel") private roomsModel: ModelsInstance.Rooms,
    @Inject("roomOtherPricesModel")
    private roomOtherPricesModel: ModelsInstance.RoomOtherPrices,
    @Inject("roomBillDetailsModel") private roomBillDetailsModel: ModelsInstance.RoomBillDetails,
    @Inject("checkRoomsModel") private checkRoomsModel: ModelsInstance.CheckRooms,
    @Inject("commissionsModel") private commissionsModel: ModelsInstance.Commissions
  ) {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async sortObject(obj: any) {
    // eslint-disable-next-line prefer-const
    let sorted: any = {};
    const str = [];
    let key;
    for (key in obj) {
      // eslint-disable-next-line no-prototype-builtins
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key));
      }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
      sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
  }
  private async buildCheckoutUrl(userPaymentId: number, payload: CheckoutPayload) {
    // await this.vnPaysModel.create({
    //   vpc_MerchTxnRef: payload.transactionId,
    //   userPaymentId: userPaymentId,
    //   amount: payload.amount,
    //   status: EVNPayStatus.CREATE,
    //   module: module,
    //   rawCheckout: payload,
    //   vpc_OrderInfo: payload.orderId,
    //   vpc_TicketNo: payload.clientIp,
    // })

    const createDate = moment().format("YYYYMMDDHHmmss");
    const locale = "vn";
    const currCode = "VND";
    let vnp_Params: any = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: process.env.vnp_TmnCode,
      vnp_Locale: locale,
      vnp_CurrCode: currCode,
      vnp_TxnRef: payload.orderId,
      vnp_OrderInfo: "Thanh toan cho ma GD:" + payload.orderId,
      vnp_OrderType: "other",
      vnp_Amount: payload.amount * 100,
      vnp_ReturnUrl: process.env.vnp_StayReturnUrl,
      vnp_IpAddr: payload.clientIp,
      vnp_CreateDate: createDate,
    };

    vnp_Params = await this.sortObject(vnp_Params);
    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", process.env.vnp_HashSecret);
    const signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");
    vnp_Params["vnp_SecureHash"] = signed;
    let vnpUrl = process.env.vnp_Url;
    vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });
    return vnpUrl;
  }
  public async getCommissionRate(price: number) {
    const commissions = await this.commissionsModel.findAll({
      where: {
        serviceType: EServiceType.HOTEL,
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

  public async create(data: Create, user: ModelsAttributes.User, res: Response) {
    const t = await sequelize.transaction();
    try {
      const stayData = await this.staysModel.findOne({
        where: {
          id: data.stayId,
        },
      });
      const commissionRate = await this.getCommissionRate(data.totalBill);
      const commission = data.totalBill * commissionRate;
      const newRoomBill = await this.roomBillsModel.create(
        {
          userId: user.id,
          stayId: data.stayId,
          stayOwnerId: stayData.owner,
          startDate: data.startDate,
          endDate: data.endDate,
          price: data.price,
          discount: data.discount,
          totalBill: data.totalBill,
          commissionRate: commissionRate,
          commission: commission,
          email: data.email,
          phoneNumber: data.phoneNumber,
          firstName: data.firstName,
          lastName: data.lastName,
          paymentStatus: EPaymentStatus.NOT_PAID,
          status: EBillStatus.NOT_CONTACTED_YET,
          expiredDate: moment().add(process.env.MAXAGE_TOKEN_BOOK_SERVICE, "minutes").toDate(),
          stayData: stayData,
        },
        {
          transaction: t,
        }
      );

      const roomIds: number[] = [];
      data?.rooms.forEach((item) => {
        if (!roomIds.includes(item.roomId)) roomIds.push(item.roomId);
      });
      const checkRooms = await this.checkRoomsModel.findAll({
        where: {
          roomId: roomIds,
          bookedDate: {
            [Op.and]: {
              [Op.gte]: data.startDate,
              [Op.lt]: data.endDate,
            },
          },
        },
      });

      const rooms = await this.roomsModel.findAll({
        // attributes: ["id", "numberOfRoom"],
        where: {
          id: roomIds,
        },
      });

      const updateCheckRooms: any[] = [];
      const createCheckRooms: any[] = [];
      const roomBillDetails = data?.rooms.map((room) => {
        const checkRoom = checkRooms.find(
          (item) =>
            item.roomId === room.roomId && moment(item.bookedDate).format("DD/MM/YYYY") === moment(room.bookedDate).format("DD/MM/YYYY")
        );
        if (checkRoom) {
          updateCheckRooms.push({
            ...checkRoom.dataValues,
            numberOfRoomsAvailable: checkRoom.numberOfRoomsAvailable - room.amount,
          });
        } else {
          createCheckRooms.push({
            bookedDate: room.bookedDate,
            numberOfRoomsAvailable: rooms.find((item) => item.id === room.roomId)?.numberOfRoom - room.amount,
            stayId: data.stayId,
            roomId: room.roomId,
          });
        }

        const commissionRoom = commission * ((room.amount * room.price * (100 - room.discount)) / 100 / data.price);
        return {
          billId: newRoomBill.id,
          roomId: room.roomId,
          stayId: data.stayId,
          stayOwnerId: stayData.owner,
          amount: room.amount,
          price: room.price,
          bookedDate: room.bookedDate,
          commission: commissionRoom,
          paymentStatus: EPaymentStatus.NOT_PAID,
          roomData: rooms.find((item) => item.id === room.roomId),
        };
      });

      await Promise.all(
        updateCheckRooms.map(
          async (item) =>
            await this.checkRoomsModel.update(
              {
                numberOfRoomsAvailable: item.numberOfRoomsAvailable,
              },
              {
                where: {
                  id: item.id,
                },
                transaction: t,
              }
            )
        )
      );

      await this.checkRoomsModel.bulkCreate(createCheckRooms, {
        transaction: t,
      });

      await this.roomBillDetailsModel.bulkCreate(roomBillDetails, {
        transaction: t,
      });

      const payload = {
        amount: data?.totalBill,
        orderId: `stay-${newRoomBill.id}`,
        clientIp: `${user.id}`,
      };
      const checkoutUrl = await this.buildCheckoutUrl(user.id, payload);

      await t.commit();
      return res.onSuccess(
        { bill: newRoomBill, checkoutUrl },
        {
          message: res.locals.t("room_bill_create_success"),
        }
      );
      //email
      // const emailRes = await EmailService.sendConfirmBookRoom(
      //   data?.userMail,
      //   `${process.env.SITE_URL}/book/verifyBookRoom?code=${newRoomBill.verifyCode}&billId=${newRoomBill.id}`
      // );
      // if (emailRes.isSuccess) {
      //   await t.commit();
      //   return res.onSuccess(newRoomBill, {
      //     message: res.locals.t("room_bill_create_success"),
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

  public async againLink(billId: number, user: ModelsAttributes.User, res: Response) {
    const t = await sequelize.transaction();
    try {
      const roomBill = await this.roomBillsModel.findOne({
        where: {
          id: billId,
        },
      });
      if (!roomBill) {
        return res.onError({
          status: 404,
          detail: "Room bill not found",
        });
      }

      let payload = {
        amount: roomBill.totalBill,
        orderId: `stay-${roomBill.id}`,
        clientIp: `${user.id}`,
      };
      if (roomBill.oldBillId) {
        payload = {
          ...payload,
          amount: roomBill.extraPay,
        };
      }
      const checkoutUrl = await this.buildCheckoutUrl(user.id, payload);
      await t.commit();
      return res.onSuccess(
        { bill: roomBill, checkoutUrl },
        {
          message: res.locals.t("get_again_link_success"),
        }
      );
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async update(billId: number, data: Update, user: ModelsAttributes.User, res: Response) {
    const t = await sequelize.transaction();
    try {
      const roomBill = await this.roomBillsModel.findOne({
        where: {
          id: billId,
        },
      });
      if (!roomBill) {
        return res.onError({
          status: 404,
          detail: "Room bill not found",
        });
      }

      if (data?.paymentStatus) {
        roomBill.paymentStatus = data.paymentStatus;
        await this.roomBillDetailsModel.update(
          {
            paymentStatus: data.paymentStatus,
          },
          {
            where: {
              billId: billId,
            },
            transaction: t,
          }
        );
        // if (data.paymentStatus === EPaymentStatus.PAID && roomBill.oldBillId) {
        //   const oldRoomBillDetails = await this.roomBillDetailsModel.findAll({
        //     where: {
        //       billId: roomBill.oldBillId
        //     }
        //   })
        //   const oldRoomIds: number[] = []
        //   oldRoomBillDetails.forEach(item => {
        //     if(!oldRoomIds.includes(item.roomId)) oldRoomIds.push(item.roomId)
        //   })
        //   const oldCheckRooms = await this.checkRoomsModel.findAll({
        //     where: {
        //       roomId: oldRoomIds
        //     }
        //   })
        //   // await Promise.all(oldRoomBillDetails.map(async(item) => (
        //   //   await this.checkRoomsModel.update({
        //   //     {
        //   //       numberOfRoomsAvailable: item
        //   //     }
        //   //   })
        //   // )))

        //   const oldBill = await this.roomBillsModel.findOne({
        //     where: {
        //       oldBillId: roomBill.oldBillId,
        //     },
        //   });
        //   if (!oldBill) {
        //     return res.onError({
        //       status: 404,
        //       detail: "Old bill not found",
        //     });
        //   }
        //   const tourOnSale = await this.tourOnSalesModel.findOne({
        //     where: {
        //       id: oldBill.tourOnSaleId,
        //       isDeleted: false,
        //     },
        //   });
        //   if (!tourOnSale) {
        //     return res.onError({
        //       status: 404,
        //       detail: "Tour on sale not found",
        //     });
        //   }
        //   tourOnSale.quantityOrdered = tourOnSale.quantityOrdered - oldBill.amountAdult - oldBill.amountChild;
        //   await tourOnSale.save({ transaction: t });
        // }
      }

      await roomBill.save({ transaction: t });
      await t.commit();
      return res.onSuccess(roomBill, {
        message: res.locals.t("room_bill_update_success"),
      });
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async findAll(data: FindAll, user: ModelsAttributes.User, res: Response) {
    try {
      const offset = data.take * (data.page - 1);
      const bills = await this.roomBillsModel.findAndCountAll({
        where: {
          userId: user.id,
          status: { [Op.not]: EBillStatus.RESCHEDULED },
        },
        include: [
          {
            association: "roomBillDetail",
            order: [
              ["roomId", "ASC"],
              ["bookedDate", "ASC"],
            ],
          },
        ],
        limit: data.take,
        offset: offset,
        distinct: true,
        order: [["createdAt", "DESC"]],
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

  public async findLatest(stayId: number, user: ModelsAttributes.User, res: Response) {
    try {
      const bill = await this.roomBillsModel.findOne({
        where: {
          userId: user.id,
          stayId: stayId,
          status: EBillStatus.USED,
        },
        order: [["createdAt", "DESC"]],
      });
      if (!bill) {
        return res.onSuccess(null, {
          message: res.locals.t("get_room_bill_latest_success"),
        });
      }
      return res.onSuccess(bill, {
        message: res.locals.t("get_room_bill_latest_success"),
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }
  /**
   * Get a room bill
   */
  // public async getRoomBill(billId: number, res: Response) {
  //   try {
  //     const bill = await this.roomBillsModel.findOne({
  //       where: {
  //         id: billId,
  //       },
  //     });
  //     if (!bill) {
  //       return res.onError({
  //         status: 404,
  //         detail: "bill_not_found",
  //       });
  //     }
  //     return res.onSuccess(bill?.dataValues, {
  //       message: res.locals.t("get_room_bill_success"),
  //     });
  //   } catch (error) {
  //     return res.onError({
  //       status: 500,
  //       detail: error,
  //     });
  //   }
  // }

  // /**
  //  * Get all room bill of any room
  //  */
  // public async getAllRoomBills(roomId: number, res: Response) {
  //   try {
  //     const bills = await this.roomBillDetailsModel.findAll({
  //       where: {
  //         roomId: roomId,
  //       },
  //       include: [
  //         {
  //           association: "detailsOfRoomBill",
  //         },
  //         {
  //           association: "belongsToRoom",
  //         },
  //       ],
  //     });
  //     if (!bills) {
  //       return res.onError({
  //         status: 404,
  //         detail: "not_found",
  //       });
  //     }
  //     const allBills: any[] = [];
  //     bills.map((item) => {
  //       allBills.push({
  //         ...item?.dataValues,
  //       });
  //     });
  //     return res.onSuccess(allBills, {
  //       message: res.locals.t("get_all_room_bills_success"),
  //     });
  //   } catch (error) {
  //     return res.onError({
  //       status: 500,
  //       detail: error,
  //     });
  //   }
  // }

  // /**
  //  * Get all room bill of any room and date
  //  */
  // public async getAllRoomBillsAnyDate(data: IGetBillsAnyRoom, res: Response) {
  //   try {
  //     const bills = await this.roomBillsModel.findAll({
  //       where: {
  //         hotelId: data.hotelId,
  //       },
  //       include: [
  //         {
  //           association: "hotelInfo",
  //         },
  //         {
  //           association: "roomBillDetail",
  //         },
  //         {
  //           association: "userInfo",
  //         },
  //       ],
  //     });
  //     if (!bills) {
  //       return res.onError({
  //         status: 404,
  //         detail: "not_found",
  //       });
  //     }
  //     const allBills: any[] = [];
  //     const dateRequest = new Date(data.date);
  //     const date = dateRequest.getDate();
  //     const month = dateRequest.getMonth();
  //     const year = dateRequest.getFullYear();
  //     bills.map((item) => {
  //       const dateCreated = new Date(item?.createdAt);
  //       const createDate = dateCreated.getDate();
  //       const createMonth = dateCreated.getMonth();
  //       const createYear = dateCreated.getFullYear();
  //       if (date === createDate && month === createMonth && year === createYear) {
  //         allBills.push({
  //           ...item?.dataValues,
  //         });
  //       }
  //     });
  //     return res.onSuccess(allBills, {
  //       message: res.locals.t("get_all_room_bills_success"),
  //     });
  //   } catch (error) {
  //     return res.onError({
  //       status: 500,
  //       detail: error,
  //     });
  //   }
  // }

  // /**
  //  * Get all room bills of any user
  //  */
  // public async getAllUserRoomBills(userId: number, res: Response) {
  //   try {
  //     const bills = await this.roomBillsModel.findAll({
  //       where: {
  //         userId: userId,
  //       },
  //       include: [
  //         {
  //           association: "roomBillDetail",
  //         },
  //         {
  //           association: "hotelInfo",
  //         },
  //       ],
  //     });
  //     if (!bills) {
  //       return res.onError({
  //         status: 404,
  //         detail: "not_found",
  //       });
  //     }
  //     const allBills: any[] = [];
  //     bills.map((item) => {
  //       if (!item?.verifyCode || new Date().getTime() < new Date(item?.expiredDate).getTime()) {
  //         allBills.push({
  //           ...item?.dataValues,
  //         });
  //       }
  //     });
  //     return res.onSuccess(allBills, {
  //       message: res.locals.t("get_all_room_bills_success"),
  //     });
  //   } catch (error) {
  //     return res.onError({
  //       status: 500,
  //       detail: error,
  //     });
  //   }
  // }

  // /**
  //  * Get room bill details
  //  */
  // public async getRoomBillDetails(billId: number, res: Response) {
  //   try {
  //     const billDetails = await this.roomBillDetailsModel.findAll({
  //       where: {
  //         billId: billId,
  //       },
  //     });
  //     if (!billDetails) {
  //       return res.onError({
  //         status: 404,
  //         detail: "not_found",
  //       });
  //     }
  //     const allBillDetails = billDetails.map((item) => {
  //       return {
  //         ...item?.dataValues,
  //       };
  //     });
  //     return res.onSuccess(allBillDetails, {
  //       message: res.locals.t("get_all_room_bill_details_success"),
  //     });
  //   } catch (error) {
  //     return res.onError({
  //       status: 500,
  //       detail: error,
  //     });
  //   }
  // }

  // private async handleCalculatePriceForRoom(roomId: number, amount: number, normalDates: string[], specialDates: string[], res: Response) {
  //   let totalPrice = 0;
  //   const room = await this.roomsModel.findOne({
  //     where: {
  //       id: roomId,
  //       isTemporarilyStopWorking: false,
  //       isDeleted: false,
  //     },
  //   });
  //   if (!room) {
  //     return res.onError({
  //       status: 404,
  //       detail: "room_not_found",
  //     });
  //   }
  //   const discount = room?.discount || 0;

  //   normalDates.map((item: any) => {
  //     const date = new Date(item).getDay();
  //     switch (date) {
  //       case 0:
  //         // sunday
  //         totalPrice += room?.sundayPrice;
  //         break;
  //       case 1:
  //         // monday
  //         totalPrice += room?.mondayPrice;
  //         break;
  //       case 2:
  //         // tuesday
  //         totalPrice += room?.tuesdayPrice;
  //         break;
  //       case 3:
  //         // wednesday
  //         totalPrice += room?.wednesdayPrice;
  //         break;
  //       case 4:
  //         // thursday
  //         totalPrice += room?.thursdayPrice;
  //         break;
  //       case 5:
  //         // friday
  //         totalPrice += room?.fridayPrice;
  //         break;
  //       default:
  //         // saturday
  //         totalPrice += room?.saturdayPrice;
  //     }
  //   });
  //   specialDates.map(async (item) => {
  //     const priceInfo = await this.roomOtherPricesModel.findOne({
  //       where: {
  //         date: item,
  //       },
  //     });
  //     if (priceInfo) {
  //       totalPrice += priceInfo?.price;
  //     }
  //   });
  //   const _totalPrice = (totalPrice * (100 - discount)) / 100;
  //   return {
  //     roomId: roomId,
  //     amount: amount,
  //     discount: discount,
  //     totalPrice: _totalPrice,
  //   };
  // }

  // public async createRoomBill(data: ICreateRoomBill, res: Response) {
  //   const t = await sequelize.transaction();
  //   try {
  //     const codeVerify = uuidv4();
  //     const newRoomBill = await this.roomBillsModel.create(
  //       {
  //         userId: data?.userId,
  //         hotelId: data?.hotelId,
  //         startDate: data?.startDate,
  //         endDate: data?.endDate,
  //         bookedDates: data?.bookedDates,
  //         totalBill: data?.totalBill,
  //         email: data?.email,
  //         phoneNumber: data?.phoneNumber,
  //         firstName: data?.firstName,
  //         lastName: data?.lastName,
  //         bankName: data?.bankName,
  //         bankAccountName: data?.bankAccountName,
  //         bankNumber: data?.bankNumber,
  //         accountExpirationDate: data?.accountExpirationDate,
  //         deposit: data?.deposit,
  //         verifyCode: codeVerify,
  //         expiredDate: moment().add(process.env.MAXAGE_TOKEN_ACTIVE, "hours").toDate(),
  //       },
  //       {
  //         transaction: t,
  //       }
  //     );

  //     const roomBillDetails = <any>[];

  //     data?.rooms.map((room: any) => {
  //       const _bookedDate = new Date(room?.bookedDate);
  //       const dateOfBookedDate = _bookedDate.getDate();
  //       const monthOfBookedDate = _bookedDate.getMonth();
  //       const yearOfBookedDate = _bookedDate.getFullYear();
  //       const bookedDateString = `${yearOfBookedDate},${monthOfBookedDate},${dateOfBookedDate}`;
  //       roomBillDetails.push({
  //         billId: newRoomBill.id,
  //         roomId: room.roomId,
  //         title: room.title,
  //         amount: room.amount,
  //         discount: room.discount,
  //         price: room.price,
  //         bookedDate: bookedDateString,
  //         totalPrice: room.totalPrice,
  //       });
  //     });
  //     await this.roomBillDetailsModel.bulkCreate(roomBillDetails, {
  //       transaction: t,
  //     });

  //     await t.commit();
  //     return res.onSuccess(newRoomBill, {
  //       message: res.locals.t("room_bill_create_success"),
  //     });
  //     //email
  //     // const emailRes = await EmailService.sendConfirmBookRoom(
  //     //   data?.userMail,
  //     //   `${process.env.SITE_URL}/book/verifyBookRoom?code=${newRoomBill.verifyCode}&billId=${newRoomBill.id}`
  //     // );
  //     // if (emailRes.isSuccess) {
  //     //   await t.commit();
  //     //   return res.onSuccess(newRoomBill, {
  //     //     message: res.locals.t("room_bill_create_success"),
  //     //   });
  //     // } else {
  //     //   await t.rollback();
  //     //   return res.onError({
  //     //     status: 500,
  //     //     detail: "email_sending_failed",
  //     //   });
  //     // }
  //   } catch (error) {
  //     await t.rollback();
  //     return res.onError({
  //       status: 500,
  //       detail: error,
  //     });
  //   }
  // }

  // public async verifyBookRoom(data: IVerifyBookRoom, res: Response) {
  //   const t = await sequelize.transaction();
  //   try {
  //     // verify code
  //     const bill = await this.roomBillsModel.findOne({
  //       where: {
  //         id: data.billId,
  //       },
  //     });
  //     if (!bill) {
  //       return res.onError({
  //         status: 404,
  //         detail: res.locals.t("room_bill_not_found"),
  //       });
  //     }
  //     // if (!bill.verifyCode) {
  //     //   return res.onError({
  //     //     status: 404,
  //     //     detail: res.locals.t("room_bill_was_verified"),
  //     //   });
  //     // }

  //     if (new Date() < new Date(bill?.expiredDate)) {
  //       const roomsOfBill = await this.roomBillDetailsModel.findAll({
  //         where: {
  //           billId: bill.id,
  //         },
  //         include: [
  //           {
  //             association: "belongsToRoom",
  //           },
  //         ],
  //       });
  //       const bookedDates = bill?.bookedDates.split(",");

  //       const dateStringArr = <any>[];
  //       bookedDates.forEach(async (dateItem) => {
  //         const _dateItem = new Date(dateItem);
  //         const dateOfDateItem = _dateItem.getDate();
  //         const monthOfDateItem = _dateItem.getMonth();
  //         const yearOfDateItem = _dateItem.getFullYear();
  //         const dateItemString = `${yearOfDateItem},${monthOfDateItem},${dateOfDateItem}`;
  //         dateStringArr.push(dateItemString);
  //       });

  //       let checkRoomReq = <any>[];
  //       roomsOfBill.forEach(async (roomItem) => {
  //         dateStringArr.forEach(async (dateItemString: any) => {
  //           checkRoomReq.push(
  //             this.checkRoomsModel.findOne({
  //               where: {
  //                 bookedDate: dateItemString,
  //                 roomId: roomItem?.roomId,
  //               },
  //             })
  //           );
  //         });
  //       });
  //       bill.verifyCode = null;
  //       await bill.save({ transaction: t });

  //       const checkRoomsRes = await Promise.all(checkRoomReq);

  //       const updateCheckRoomReq = <any>[];
  //       const createCheckRoomReq = <any>[];
  //       checkRoomsRes.map(async (checkRoom, index) => {
  //         if (checkRoom) {
  //           const roomBillDetail = roomsOfBill.filter((rb) => Number(rb?.dataValues?.roomId) === Number(checkRoom?.dataValues?.roomId))[0];
  //           checkRoom.numberOfRoomsAvailable = checkRoom.numberOfRoomsAvailable - roomBillDetail.amount;
  //           updateCheckRoomReq.push(checkRoom.save({ transaction: t }));
  //         } else {
  //           checkRoomReq.push(
  //             await this.checkRoomsModel.create({
  //               bookedDate: roomsOfBill[index].bookedDate,
  //               roomId: roomsOfBill[index].roomId,
  //               numberOfRoomsAvailable: roomsOfBill[index].belongsToRoom.numberOfRoom - roomsOfBill[index].amount,
  //             })
  //           );
  //         }
  //       });

  //       await Promise.all([...updateCheckRoomReq, ...createCheckRoomReq]);
  //       await t.commit();
  //       return res.onSuccess({
  //         detail: res.locals.t("create_check_room_is_successful"),
  //       });
  //     } else {
  //       await t.rollback();
  //       return res.onError({
  //         status: 400,
  //         detail: res.locals.t("the_verification_code_has_expired"),
  //       });
  //     }
  //   } catch (error) {
  //     await t.rollback();
  //     return res.onError({
  //       status: 500,
  //       detail: error,
  //     });
  //   }
  // }
  // /**
  //  * Cancel room bill
  //  */
  // public async cancelRoomBill(billId: number, res: Response) {
  //   const t = await sequelize.transaction();
  //   try {
  //     const detailRoomBills = await this.roomBillDetailsModel.findAll({
  //       where: {
  //         billId: billId,
  //       },
  //     });
  //     const detailIds = detailRoomBills.map((item) => item?.id);
  //     await this.roomBillDetailsModel.destroy({
  //       where: {
  //         id: detailIds,
  //       },
  //     });
  //     await this.roomBillsModel.destroy({
  //       where: {
  //         id: billId,
  //       },
  //     });
  //     await t.commit();
  //     return res.onSuccess("Cancel successfully", {
  //       message: res.locals.t("Cancel successfully"),
  //     });
  //   } catch (error) {
  //     return res.onError({
  //       status: 500,
  //       detail: error,
  //     });
  //   }
  // }

  // /**
  //  * Get all hotels revenue by month
  //  */
  // public async getRevenueOfHotelsByMonth(data: IGetHotelsRevenueByMonth, res: Response) {
  //   try {
  //     const bills = await this.roomBillsModel.findAll({
  //       where: {
  //         hotelId: {
  //           [Op.or]: data.hotelIds,
  //         },
  //         verifyCode: null,
  //       },
  //     });
  //     if (!bills) {
  //       return res.onError({
  //         status: 404,
  //         detail: "not_found",
  //       });
  //     }
  //     const hotelBillArr: RoomBillAttributes[][] = [];
  //     data.hotelIds.forEach((hotelId) => {
  //       hotelBillArr.push(
  //         bills.filter(
  //           (bill) =>
  //             bill?.dataValues?.hotelId === hotelId &&
  //             new Date(bill?.dataValues?.createdAt).getMonth() === data.month &&
  //             new Date(bill?.dataValues?.createdAt).getFullYear() === data.year
  //         )
  //       );
  //     });
  //     const hotelBillDetailArr: any[][] = [];
  //     hotelBillArr.forEach((hotelBills) => {
  //       const hotelBillDetail: any[] = [];
  //       hotelBills.forEach((billItem) => {
  //         const date = new Date(billItem?.dataValues?.createdAt).getDate();
  //         let isNotHaveDate = true;
  //         hotelBillDetail.forEach((detailItem) => {
  //           if (detailItem?.date === date) {
  //             isNotHaveDate = false;
  //             detailItem!.cost += billItem?.dataValues?.totalBill;
  //           }
  //         });
  //         if (isNotHaveDate) {
  //           hotelBillDetail.push({
  //             date: date,
  //             cost: billItem?.dataValues?.totalBill,
  //           });
  //         }
  //       });
  //       hotelBillDetailArr.push(hotelBillDetail);
  //     });
  //     return res.onSuccess(hotelBillDetailArr, {
  //       message: res.locals.t("get_all_hotel_bills_success"),
  //     });
  //   } catch (error) {
  //     return res.onError({
  //       status: 500,
  //       detail: error,
  //     });
  //   }
  // }

  // /**
  //  * Get all hotels revenue by year
  //  */
  // public async getRevenueOfHotelsByYear(data: IGetHotelsRevenueByYear, res: Response) {
  //   try {
  //     const bills = await this.roomBillsModel.findAll({
  //       where: {
  //         hotelId: {
  //           [Op.or]: data.hotelIds,
  //         },
  //         verifyCode: null,
  //       },
  //     });
  //     if (!bills) {
  //       return res.onError({
  //         status: 404,
  //         detail: "not_found",
  //       });
  //     }
  //     const hotelBillArr: RoomBillAttributes[][] = [];
  //     data.hotelIds.forEach((hotelId) => {
  //       hotelBillArr.push(
  //         bills.filter((bill) => bill?.dataValues?.hotelId === hotelId && new Date(bill?.dataValues?.createdAt).getFullYear() === data.year)
  //       );
  //     });
  //     const hotelBillDetailArr: any[][] = [];
  //     hotelBillArr.forEach((hotelBills) => {
  //       const hotelBillDetail: any[] = [];
  //       hotelBills.forEach((billItem) => {
  //         const month = new Date(billItem?.dataValues?.createdAt).getMonth();
  //         let isNotHaveMonth = true;
  //         hotelBillDetail.forEach((detailItem) => {
  //           if (detailItem?.month === month) {
  //             isNotHaveMonth = false;
  //             detailItem!.cost += billItem?.dataValues?.totalBill;
  //           }
  //         });
  //         if (isNotHaveMonth) {
  //           hotelBillDetail.push({
  //             month: month,
  //             cost: billItem?.dataValues?.totalBill,
  //           });
  //         }
  //       });
  //       hotelBillDetailArr.push(hotelBillDetail);
  //     });
  //     return res.onSuccess(hotelBillDetailArr, {
  //       message: res.locals.t("get_all_hotel_bills_success"),
  //     });
  //   } catch (error) {
  //     return res.onError({
  //       status: 500,
  //       detail: error,
  //     });
  //   }
  // }
}
