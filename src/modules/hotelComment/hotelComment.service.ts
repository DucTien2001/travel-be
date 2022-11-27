import Container, { Inject, Service } from "typedi";
import { sequelize } from "database/models";
import { Response } from "express";
import { ICreateHotelComment, IReplyHotelComment, IUpdateHotelComment } from "./hotelComment.models";

@Service()
export default class HotelCommentService {
  constructor(@Inject("hotelCommentsModel") private hotelCommentsModel: ModelsInstance.HotelComments) {}
  /**
   * Get hotel comments
   */
  public async getHotelComments(hotelId: number, res: Response) {
    try {
      const listHotelComments = await this.hotelCommentsModel.findAll({
        where: {
          hotelId: hotelId,
        },
        include: {
          association: "hotelReviewer"
        }
      });
      if (!listHotelComments) {
        return res.onError({
          status: 404,
          detail: "Not found",
        });
      }
      const hotelComments = listHotelComments.map((item) => {
        return {
          ...item?.dataValues,
        };
      });
      return res.onSuccess(hotelComments, {
        message: res.locals.t("get_hotel_comments_success"),
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async createNewHotelComment(data: ICreateHotelComment, res: Response) {
    const t = await sequelize.transaction();
    try {
      const newHotelComment = await this.hotelCommentsModel.create(
        {
          comment: data?.comment || "",
          rate: data?.rate || 1,
          hotelId: data?.hotelId,
          billId: data?.billId,
          userId: data?.userId,
        },
        {
          transaction: t,
        }
      );
      await t.commit();
      return res.onSuccess(newHotelComment, {
        message: res.locals.t("hotel_comment_create_success"),
      });
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async updateHotelComment(commentId: number, data: IUpdateHotelComment, res: Response) {
    const t = await sequelize.transaction();
    try {
      const hotelCmt = await this.hotelCommentsModel.findOne({
        where: {
          id: commentId,
        },
      });
      if (!hotelCmt) {
        await t.rollback();
        return res.onError({
          status: 404,
          detail: res.locals.t("hotel_comment_not_found"),
        });
      }
      if (data.comment) hotelCmt.comment = data.comment;
      if (data.rate) hotelCmt.rate = data.rate;

      await hotelCmt.save({ transaction: t });
      await t.commit();
      return res.onSuccess(hotelCmt, {
        message: res.locals.t("hotel_comment_update_success"),
      });
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }
  
  public async replyHotelComment(commentId: number, data: IReplyHotelComment, res: Response) {
    const t = await sequelize.transaction();
    try {
      const hotelCmt = await this.hotelCommentsModel.findOne({
        where: {
          id: commentId,
        },
      });
      if (!hotelCmt) {
        await t.rollback();
        return res.onError({
          status: 404,
          detail: res.locals.t("hotel_comment_not_found"),
        });
      }
      if (data.replyComment) hotelCmt.replyComment = data.replyComment;

      await hotelCmt.save({ transaction: t });
      await t.commit();
      return res.onSuccess(hotelCmt, {
        message: res.locals.t("reply_hotel_comment_success"),
      });
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async deleteHotelComment(commentId: number, res: Response) {
    const t = await sequelize.transaction();
    try {
      const hotelCmtDelete = await this.hotelCommentsModel.destroy({
        where: {
          id: commentId,
        },
      });
      await t.commit();
      return res.onSuccess("Delete success", {
        message: res.locals.t("hotel_comment_delete_success"),
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
