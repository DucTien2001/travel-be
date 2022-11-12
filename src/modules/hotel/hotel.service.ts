import Container, { Inject, Service } from "typedi";
import { sequelize } from "database/models";
import { Response } from "express";
import { ICreateHotel, IUpdateHotel } from "./hotel.models";

@Service()
export default class HotelService {
  constructor(@Inject("hotelsModel") private hotelsModel: ModelsInstance.Hotels) {}
  /**
   * Get hotel of user
   */
  public async getHotel(hotelId: number, res: Response) {
    try {
      const hotel = await this.hotelsModel.findOne({
        where: {
          id: hotelId,
        },
      });
      if (!hotel) {
        return res.onError({
          status: 404,
          detail: "Not found",
        });
      }
      const result = {
        ...hotel?.dataValues,
        tags: hotel?.tags.split(","),
      };
      return res.onSuccess(result, {
        message: res.locals.t("get_hotel_success"),
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  /**
   * Get hotels of user
   */
  public async getHotels(userId: number, res: Response) {
    try {
      const listHotels = await this.hotelsModel.findAll({
        where: {
          creator: userId,
          isDeleted: false,
        },
      });
      if (!listHotels) {
        return res.onError({
          status: 404,
          detail: "Not found",
        });
      }
      const hotels = listHotels.map((item) => {
        return {
          ...item?.dataValues,
          tags: item?.tags.split(","),
        };
      });
      return res.onSuccess(hotels, {
        message: res.locals.t("get_hotels_success"),
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  /**
   * Get all hotels
   */
  public async getAllHotels(res: Response) {
    try {
      const listHotels = await this.hotelsModel.findAll({
        where: {
          isTemporarilyStopWorking: false,
          isDeleted: false,
        },
      });
      if (!listHotels) {
        return res.onError({
          status: 404,
          detail: "Not found",
        });
      }
      const hotels = listHotels.map((item) => {
        return {
          ...item?.dataValues,
          tags: item?.tags.split(","),
        };
      });
      return res.onSuccess(hotels, {
        message: res.locals.t("get_all_hotels_success"),
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async createNewHotel(data: ICreateHotel, res: Response) {
    const t = await sequelize.transaction();
    try {
      const newHotel = await this.hotelsModel.create(
        {
          name: data?.name,
          description: data?.description || "",
          checkInTime: data?.checkInTime,
          checkOutTime: data?.checkOutTime,
          location: data?.location,
          tags: data?.tags || "",
          images: data?.images,
          rate: 0,
          creator: data?.creator,
          isTemporarilyStopWorking: false,
          isDeleted: false,
        },
        {
          transaction: t,
        }
      );
      await t.commit();
      return res.onSuccess(newHotel, {
        message: res.locals.t("hotel_create_success"),
      });
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async updateHotel(hotelId: number, data: IUpdateHotel, res: Response) {
    const t = await sequelize.transaction();
    try {
      const hotel = await this.hotelsModel.findOne({
        where: {
          id: hotelId,
          isDeleted: false,
        },
      });
      if (!hotel) {
        await t.rollback();
        return res.onError({
          status: 404,
          detail: res.locals.t("hotel_not_found"),
        });
      }
      if (data.name) hotel.name = data.name;
      if (data.description) hotel.description = data.description;
      if (data.checkInTime) hotel.checkInTime = data.checkInTime;
      if (data.checkOutTime) hotel.checkOutTime = data.checkOutTime;
      if (data.location) hotel.location = data.location;
      if (data.tags) hotel.tags = data.tags;
      if (data.images) hotel.images = data.images;

      await hotel.save({ transaction: t });
      await t.commit();
      return res.onSuccess(hotel, {
        message: res.locals.t("hotel_update_success"),
      });
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async temporarilyStopWorking(hotelId: number, res: Response) {
    const t = await sequelize.transaction();
    try {
      const hotel = await this.hotelsModel.findOne({
        where: {
          id: hotelId,
        },
      });
      if (!hotel) {
        await t.rollback();
        return res.onError({
          status: 404,
          detail: res.locals.t("hotel_not_found"),
        });
      }
      hotel.isTemporarilyStopWorking = true;

      await hotel.save({ transaction: t });
      await t.commit();
      return res.onSuccess(hotel, {
        message: res.locals.t("hotel_temporarily_stop_working_success"),
      });
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async deleteHotel(hotelId: number, res: Response) {
    const t = await sequelize.transaction();
    try {
      const hotel = await this.hotelsModel.findOne({
        where: {
          id: hotelId,
        },
      });
      if (!hotel) {
        await t.rollback();
        return res.onError({
          status: 404,
          detail: res.locals.t("hotel_not_found"),
        });
      }
      hotel.isDeleted = true;

      await hotel.save({ transaction: t });
      await t.commit();
      return res.onSuccess(hotel, {
        message: res.locals.t("hotel_delete_success"),
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
