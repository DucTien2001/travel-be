import Container, { Inject, Service } from "typedi";
import {
  ICreateRoomOtherPrice,
  IDeletePrice,
  IGetAllPrice,
  IGetPrice,
  IUpdateRoomOtherPrice,
} from "./roomOtherPrice.models";
import database, { sequelize } from "database/models";
import { Response } from "express";

@Service()
export default class RoomOtherPriceService {
  constructor(@Inject("roomOtherPricesModel") private roomOtherPricesModel: ModelsInstance.RoomOtherPrices) {}
  /**
   * Get the price of any day of the room
   */
  public async getPrice(data: IGetPrice, res: Response) {
    try {
      const price = await this.roomOtherPricesModel.findOne({
        where: {
          roomId: data?.roomId,
          date: data?.date,
        },
      });
      if (!price) {
        return res.onError({
          status: 404,
          detail: "Not found",
        });
      }
      return res.onSuccess(price?.dataValues, {
        message: res.locals.t("get_price_success"),
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  /**
   * Get the price of all special days of the room
   */
  public async getAllPrices(data: IGetAllPrice, res: Response) {
    try {
      const allPrices = await this.roomOtherPricesModel.findAll({
        where: {
          roomId: data?.roomId,
        },
      });
      if (!allPrices) {
        return res.onError({
          status: 404,
          detail: "Not found",
        });
      }
      const prices = allPrices.map((item) => {
        return {
          ...item?.dataValues,
        };
      });
      return res.onSuccess(prices, {
        message: res.locals.t("get_all_prices_success"),
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async createNewPrice(data: ICreateRoomOtherPrice, res: Response) {
    const t = await sequelize.transaction();
    try {
      const newPrice = await this.roomOtherPricesModel.create(
        {
          date: data?.date,
          price: data?.price,
          roomId: data?.roomId,
          isDeleted: false,
        },
        {
          transaction: t,
        }
      );
      await t.commit();
      return res.onSuccess(newPrice, {
        message: res.locals.t("room_price_create_success"),
      });
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async updatePrice(data: IUpdateRoomOtherPrice, res: Response) {
    const t = await sequelize.transaction();
    try {
      const room = await this.roomOtherPricesModel.findOne({
        where: {
          id: data?.roomId,
          date: data?.date,
          isDeleted: false,
        },
      });
      if (!room) {
        await t.rollback();
        return res.onError({
          status: 404,
          detail: res.locals.t("price_of_room_not_found"),
        });
      }
      if (data.price) room.price = data.price;

      await room.save({ transaction: t });
      await t.commit();
      return res.onSuccess(room, {
        message: res.locals.t("room_information_update_success"),
      });
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async deletePrice(data: IDeletePrice, res: Response) {
    const t = await sequelize.transaction();
    try {
      const room = await this.roomOtherPricesModel.findOne({
        where: {
          id: data?.roomId,
          date: data?.date,
          isDeleted: false,
        },
      });
      if (!room) {
        await t.rollback();
        return res.onError({
          status: 404,
          detail: res.locals.t("price_of_room_not_found"),
        });
      }
      room.isDeleted = true;

      await room.save({ transaction: t });
      await t.commit();
      return res.onSuccess(room, {
        message: res.locals.t("room_other_price_delete_success"),
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
