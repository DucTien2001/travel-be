import Container, { Inject, Service } from "typedi";
import { ICreateRoom, IUpdateRoomInfo, IUpdateRoomPrice } from "./room.models";
import { sequelize } from "database/models";
import { Response } from "express";

@Service()
export default class RoomService {
  constructor(@Inject("roomsModel") private roomsModel: ModelsInstance.Rooms) {}
  /**
   * Get room
   */
  public async getRoom(roomId: number, res: Response) {
    try {
      const room = await this.roomsModel.findOne({
        where: {
          id: roomId,
        },
      });
      if (!room) {
        return res.onError({
          status: 404,
          detail: "Not found",
        });
      }
      const result = {
        ...room?.dataValues,
        tags: room?.tags.split(","),
        images: room?.images.split(",")
      };
      return res.onSuccess(result, {
        message: res.locals.t("get_room_success"),
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  /**
   * Get rooms of user
   */
  public async getRooms(userId: number, res: Response) {
    try {
      const listRooms = await this.roomsModel.findAll({
        where: {
          creator: userId,
          isDeleted: false,
        },
      });
      if (!listRooms) {
        return res.onError({
          status: 404,
          detail: "Not found",
        });
      }
      const rooms = listRooms.map((item) => {
        return {
          ...item?.dataValues,
          tags: item?.tags.split(","),
          images: item?.images.split(",")
        };
      });
      return res.onSuccess(rooms, {
        message: res.locals.t("get_rooms_success"),
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  /**
   * Get all rooms
   */
  public async getAllRooms(res: Response) {
    try {
      const listRooms = await this.roomsModel.findAll({
        where: {
          isTemporarilyStopWorking: false,
          isDeleted: false,
        },
      });
      if (!listRooms) {
        return res.onError({
          status: 404,
          detail: "Not found",
        });
      }
      const rooms = listRooms.map((item) => {
        return {
          ...item?.dataValues,
          tags: item?.tags.split(","),
          images: item?.images.split(",")
        };
      });
      return res.onSuccess(rooms, {
        message: res.locals.t("get_all_rooms_success"),
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async createNewRoom(data: ICreateRoom, res: Response) {
    const t = await sequelize.transaction();
    try {
      const newRoom = await this.roomsModel.create(
        {
          title: data?.title,
          description: data?.description,
          discount: data?.discount || 0,
          tags: data?.tags || "",
          images: data?.images,
          hotelId: data?.hotelId,
          numberOfBed: data?.numberOfBed,
          numberOfRoom: data?.numberOfRoom,
          mondayPrice: data?.mondayPrice,
          tuesdayPrice: data?.tuesdayPrice,
          wednesdayPrice: data?.wednesdayPrice,
          thursdayPrice: data?.thursdayPrice,
          fridayPrice: data?.fridayPrice,
          saturdayPrice: data?.saturdayPrice,
          sundayPrice: data?.sundayPrice,
          isTemporarilyStopWorking: false,
          isDeleted: false,
        },
        {
          transaction: t,
        }
      );
      await t.commit();
      return res.onSuccess({...newRoom, images: newRoom.images.split(",")}, {
        message: res.locals.t("room_create_success"),
      });
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async updateRoomInformation(roomId: number, data: IUpdateRoomInfo, res: Response) {
    const t = await sequelize.transaction();
    try {
      const room = await this.roomsModel.findOne({
        where: {
          id: roomId,
          isDeleted: false,
        },
      });
      if (!room) {
        await t.rollback();
        return res.onError({
          status: 404,
          detail: res.locals.t("room_not_found"),
        });
      }
      if (data.title) room.title = data.title;
      if (data.description) room.description = data.description;
      if (data.tags) room.tags = data.tags;
      if (data.images) room.images = data.images;
      if (data.numberOfBed) room.numberOfBed = data.numberOfBed;
      if (data.numberOfRoom) room.numberOfRoom = data.numberOfRoom;

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

  public async updateRoomPrice(roomId: number, data: IUpdateRoomPrice, res: Response) {
    const t = await sequelize.transaction();
    try {
      const room = await this.roomsModel.findOne({
        where: {
          id: roomId,
        },
      });
      if (!room) {
        await t.rollback();
        return res.onError({
          status: 404,
          detail: res.locals.t("room_not_found"),
        });
      }

      if (data.discount) room.discount = data.discount;
      if (data.mondayPrice) room.mondayPrice = data.mondayPrice;
      if (data.tuesdayPrice) room.tuesdayPrice = data.tuesdayPrice;
      if (data.wednesdayPrice) room.wednesdayPrice = data.wednesdayPrice;
      if (data.thursdayPrice) room.thursdayPrice = data.thursdayPrice;
      if (data.fridayPrice) room.fridayPrice = data.fridayPrice;
      if (data.saturdayPrice) room.saturdayPrice = data.saturdayPrice;
      if (data.sundayPrice) room.sundayPrice = data.sundayPrice;

      await room.save({ transaction: t });
      await t.commit();
      return res.onSuccess(room, {
        message: res.locals.t("room_price_update_success"),
      });
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async temporarilyStopWorking(roomId: number, res: Response) {
    const t = await sequelize.transaction();
    try {
      const room = await this.roomsModel.findOne({
        where: {
          id: roomId,
        },
      });
      if (!room) {
        await t.rollback();
        return res.onError({
          status: 404,
          detail: res.locals.t("room_not_found"),
        });
      }
      room.isTemporarilyStopWorking = true;

      await room.save({ transaction: t });
      await t.commit();
      return res.onSuccess(room, {
        message: res.locals.t("room_temporarily_stop_working_success"),
      });
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async deleteRoom(roomId: number, res: Response) {
    const t = await sequelize.transaction();
    try {
      const room = await this.roomsModel.findOne({
        where: {
          id: roomId,
        },
      });
      if (!room) {
        await t.rollback();
        return res.onError({
          status: 404,
          detail: res.locals.t("room_not_found"),
        });
      }
      room.isDeleted = true;

      await room.save({ transaction: t });
      await t.commit();
      return res.onSuccess(room, {
        message: res.locals.t("room_delete_success"),
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
