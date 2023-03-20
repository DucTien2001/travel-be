import { Inject, Service } from "typedi";
import { CreateMultiple, CreateOne, Update } from "./tour_schedule.models";
import { Response } from "express";
import { sequelize } from "database/models";

@Service()
export default class TourScheduleService {
  constructor(@Inject("tourSchedulesModel") private tourSchedulesModel: ModelsInstance.TourSchedules) {}
  public async createOne(data: CreateOne, res: Response) {
    const t = await sequelize.transaction();
    try {
      const tourSchedule = await this.tourSchedulesModel.create(
        {
          tourId: data?.tourId,
          day: data?.day,
          startTime: data?.startTime,
          endTime: data?.endTime,
          description: data?.description,
        },
        {
          transaction: t,
        }
      );
      await t.commit();
      return res.onSuccess(tourSchedule, {
        message: res.locals.t("tour_schedule_create_success"),
      });
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async createMultiple(data: CreateMultiple, res: Response) {
    const t = await sequelize.transaction();
    try {
      await Promise.all(
        data?.schedule?.map(async (item) => {
          await this.tourSchedulesModel.create(
            {
              tourId: data?.tourId,
              day: data?.day,
              startTime: item?.startTime,
              endTime: item?.endTime,
              description: item?.description,
            },
            {
              transaction: t,
            }
          );
        })
      );
      await t.commit();
      return res.onSuccess({
        message: res.locals.t("tour_schedule_create_success"),
      });
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async update(id: number, data: Update, res: Response) {
    const t = await sequelize.transaction();
    try {
      const schedule = await this.tourSchedulesModel.findOne({
        where: {
          id: id,
        },
      });
      if (!schedule) {
        return res.onError({
          status: 404,
          detail: res.locals.t("common_not_found"),
        });
      }
      schedule.startTime = data.startTime;
      schedule.endTime = data.endTime;
      schedule.description = data.description;
      await schedule.save();
      await t.commit();
      return res.onSuccess(schedule, {
        message: res.locals.t("tour_schedule_update_success"),
      });
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async delete(id: number, res: Response) {
    const t = await sequelize.transaction();
    try {
      const schedule = await this.tourSchedulesModel.findOne({
        where: {
          id: id,
        },
      });
      if (!schedule) {
        return res.onError({
          status: 404,
          detail: res.locals.t("common_not_found"),
        });
      }
      await schedule.destroy({ transaction: t })
      await t.commit();
      return res.onSuccess(schedule, {
        message: res.locals.t("common_delete_success"),
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
