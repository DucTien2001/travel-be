import Container, { Inject, Service } from "typedi";
import { ITour, IUpdateTour } from "./tour.models";
import { sequelize } from "database/models";
import { Response } from "express";

@Service()
export default class TourService {
  constructor(@Inject("toursModel") private toursModel: ModelsInstance.Tours) {}
  /**
   * Get tour of user
   */
  public async getTour(tourId: number, res: Response) {
    try {
      const tour = await this.toursModel.findOne({
        where: {
          id: tourId,
        },
      });
      if (!tour) {
        return res.onError({
          status: 404,
          detail: "Not found",
        });
      }
      const result = {
        ...tour?.dataValues,
        businessHours: tour?.businessHours.split(","),
        tags: tour?.tags.split(","),
      };
      return res.onSuccess(result, {
        message: res.locals.t("get_tour_success"),
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  /**
   * Get tours of user
   */
  public async getTours(userId: number, res: Response) {
    try {
      const listTours = await this.toursModel.findAll({
        where: {
          creator: userId,
          isDeleted: false,
        },
      });
      if (!listTours) {
        return res.onError({
          status: 404,
          detail: "Not found",
        });
      }
      const tours = listTours.map((item) => {
        return {
          ...item?.dataValues,
          businessHours: item?.businessHours.split(","),
          tags: item?.tags.split(","),
        };
      });
      return res.onSuccess(tours, {
        message: res.locals.t("get_tours_success"),
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  /**
   * Get all tours
   */
  public async getAllTours(res: Response) {
    try {
      const listTours = await this.toursModel.findAll({
        where: {
          isTemporarilyStopWorking: false,
          isDeleted: false,
        },
      });
      if (!listTours) {
        return res.onError({
          status: 404,
          detail: "Not found",
        });
      }
      const tours = listTours.map((item) => {
        return {
          ...item?.dataValues,
          businessHours: item?.businessHours.split(","),
          tags: item?.tags.split(","),
        };
      });
      return res.onSuccess(tours, {
        message: res.locals.t("get_all_tours_success"),
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async createNewTour(data: ITour, res: Response) {
    const t = await sequelize.transaction();
    try {
      const newTour = await this.toursModel.create(
        {
          title: data?.title,
          description: data?.description || "",
          businessHours: data?.businessHours || "",
          location: data?.location,
          price: data?.price,
          discount: data?.discount || 0,
          tags: data?.tags || "",
          images: data?.images,
          rate: data?.rate || 0,
          creator: data?.creator,
          isTemporarilyStopWorking: data?.isTemporarilyStopWorking || false,
          isDeleted: data?.isDeleted || false,
        },
        {
          transaction: t,
        }
      );
      await t.commit();
      return res.onSuccess(newTour, {
        message: res.locals.t("tour_create_success"),
      });
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async updateTour(tourId: number, data: IUpdateTour, res: Response) {
    const t = await sequelize.transaction();
    try {
      const tour = await this.toursModel.findOne({
        where: {
          id: tourId,
          isDeleted: false,
        },
      });
      if (!tour) {
        await t.rollback();
        return res.onError({
          status: 404,
          detail: res.locals.t("tour_not_found"),
        });
      }
      if (data.title) tour.title = data.title;
      if (data.description) tour.description = data.description;
      if (data.businessHours) tour.businessHours = data.businessHours;
      if (data.location) tour.location = data.location;
      if (data.price) tour.price = data.price;
      if (data.discount) tour.discount = data.discount;
      if (data.tags) tour.tags = data.tags;
      if (data.images) tour.images = data.images;

      await tour.save({ transaction: t });
      await t.commit();
      return res.onSuccess(tour, {
        message: res.locals.t("tour_update_success"),
      });
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async temporarilyStopWorking(tourId: number, res: Response) {
    const t = await sequelize.transaction();
    try {
      const tour = await this.toursModel.findOne({
        where: {
          id: tourId,
        },
      });
      if (!tour) {
        await t.rollback();
        return res.onError({
          status: 404,
          detail: res.locals.t("tour_not_found"),
        });
      }
      tour.isTemporarilyStopWorking = true;

      await tour.save({ transaction: t });
      await t.commit();
      return res.onSuccess(tour, {
        message: res.locals.t("tour_temporarily_stop_working_success"),
      });
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async deleteTour(tourId: number, res: Response) {
    const t = await sequelize.transaction();
    try {
      const tour = await this.toursModel.findOne({
        where: {
          id: tourId,
        },
      });
      if (!tour) {
        await t.rollback();
        return res.onError({
          status: 404,
          detail: res.locals.t("tour_not_found"),
        });
      }
      tour.isDeleted = true;

      await tour.save({ transaction: t });
      await t.commit();
      return res.onSuccess(tour, {
        message: res.locals.t("tour_delete_success"),
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
