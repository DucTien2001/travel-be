import { Inject, Service } from "typedi";
import { Create, FindAll, FindOne, Update } from "./tour.models";
import { Response } from "express";
import { WhereOptions } from "sequelize";
import { sequelize } from "database/models";
import FileService from "services/file";
import GetLanguage from "services/getLanguage";

@Service()
export default class TourService {
  constructor(@Inject("toursModel") private toursModel: ModelsInstance.Tours) {}
  /**
   * Find all
   */
  public async findAll(data: FindAll, user: ModelsAttributes.User, res: Response) {
    try {
      let enterpriseId = user.enterpriseId || user.id;

      let whereOptions: WhereOptions = {
        parentLanguage: null,
        isDeleted: false,
        owner: enterpriseId,
      };

      let offset = data.take * (data.page - 1);

      const listTours = await this.toursModel.findAndCountAll({
        where: whereOptions,
        include: [
          {
            association: "languages",
          },
        ],
        limit: data.take,
        offset: offset,
        distinct: true,
      });

      return res.onSuccess(listTours.rows, {
        meta: {
          take: data.take,
          itemCount: listTours.count,
          page: data.page,
          pageCount: Math.ceil(listTours.count / data.take),
        },
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async findOne(id: number, data: FindOne, user: ModelsAttributes.User, res: Response) {
    try {
      let enterpriseId = user.enterpriseId || user.id;

      let whereOptions: WhereOptions = {
        id: id,
        parentLanguage: null,
        isDeleted: false,
        owner: enterpriseId,
      };

      let tour = await this.toursModel.findOne({
        where: whereOptions,
        include: [
          {
            association: "languages",
          },
        ],
      });

      if (!tour) {
        return res.onError({
          status: 404,
          detail: "Tour not found",
        });
      }

      if (data.language) {
        tour = GetLanguage.getLang(tour.toJSON(), data.language, [
          "title",
          "city",
          "district",
          "commune",
          "moreLocation",
          "description",
          "suitablePerson",
          "highlight",
          "termsAndCondition",
        ]);
      }

      return res.onSuccess(tour);
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async create(data: Create, files: Express.Multer.File[], user: ModelsAttributes.User, res: Response) {
    const t = await sequelize.transaction();
    try {
      const images = await FileService.uploadAttachments([...files]);
      if (!images?.length) {
        await t.rollback();
        return res.onError({
          status: 400,
          detail: "Image is required",
        });
      }
      const imageUrls = images?.map((image) => image?.url);

      const newTour = await this.toursModel.create(
        {
          title: data?.title,
          numberOfDays: data?.numberOfDays,
          numberOfNights: data?.numberOfNights,
          images: imageUrls,
          contact: data?.contact,
          city: data?.city || "",
          district: data?.district || "",
          commune: data?.commune || "",
          moreLocation: data?.moreLocation || "",
          description: data?.description,
          suitablePerson: data?.suitablePerson,
          highlight: data?.highlight,
          termsAndCondition: data?.termsAndCondition,
          rate: 0,
          creator: user?.id,
          owner: user.enterpriseId || user.id,
          isDeleted: false,
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

  public async update(id: number, data: Update, files: Express.Multer.File[], user: ModelsAttributes.User, res: Response) {
    const t = await sequelize.transaction();
    try {
      if (data.imagesDeleted) {
        await FileService.deleteFiles(data.imagesDeleted);
      }
      const images = await FileService.uploadAttachments([...files]);
      const imageUrls = images?.map((image) => image?.url);

      const tour = await this.toursModel.findOne({
        where: {
          id: id,
        },
      });
      if (!tour) {
        await t.rollback();
        return res.onError({
          status: 404,
          detail: "Tour not found",
        });
      }
      const newImageUrls = tour.images.concat(imageUrls);

      await this.toursModel.update(
        {
          numberOfDays: data?.numberOfDays,
          numberOfNights: data?.numberOfNights,
          images: newImageUrls,
          contact: data?.contact,
        },
        {
          where: {
            parentLanguage: id,
          },
          transaction: t,
        }
      );

      if (data.language) {
        tour.numberOfDays = data?.numberOfDays;
        tour.numberOfNights = data?.numberOfNights;
        tour.images = newImageUrls;
        tour.contact = data?.contact;
        await tour.save({ transaction: t });

        const tourLang = await this.toursModel.findOne({
          where: {
            parentLanguage: id,
            language: data.language,
          },
        });
        if (!tourLang) {
          const tourNew = await this.toursModel.create(
            {
              title: data?.title,
              numberOfDays: data?.numberOfDays,
              numberOfNights: data?.numberOfNights,
              images: newImageUrls,
              contact: data?.contact,
              city: data?.city || "",
              district: data?.district || "",
              commune: data?.commune || "",
              moreLocation: data?.moreLocation || "",
              description: data?.description,
              suitablePerson: data?.suitablePerson,
              highlight: data?.highlight,
              termsAndCondition: data?.termsAndCondition,
              rate: 0,
              creator: user?.id,
              owner: user.enterpriseId || user.id,
              isDeleted: false,
            },
            { transaction: t }
          );
          await t.commit();
          return res.onSuccess(tourNew, {
            message: res.locals.t("common_update_success"),
          });
        } else {
          tourLang.title = data?.title;
          tourLang.numberOfDays = data?.numberOfDays;
          tourLang.numberOfNights = data?.numberOfNights;
          tourLang.images = newImageUrls;
          tourLang.contact = data?.contact;
          tourLang.city = data?.city || "";
          tourLang.district = data?.district || "";
          tourLang.commune = data?.commune || "";
          tourLang.moreLocation = data?.moreLocation || "";
          tourLang.description = data?.description;
          tourLang.suitablePerson = data?.suitablePerson;
          tourLang.highlight = data?.highlight;
          tourLang.termsAndCondition = data?.termsAndCondition;
          await tourLang.save({ transaction: t });
          await t.commit();
          return res.onSuccess(tourLang, {
            message: res.locals.t("common_update_success"),
          });
        }
      }
      tour.title = data?.title;
      tour.numberOfDays = data?.numberOfDays;
      tour.numberOfNights = data?.numberOfNights;
      tour.images = newImageUrls;
      tour.contact = data?.contact;
      tour.city = data?.city || "";
      tour.district = data?.district || "";
      tour.commune = data?.commune || "";
      tour.moreLocation = data?.moreLocation || "";
      tour.description = data?.description;
      tour.suitablePerson = data?.suitablePerson;
      tour.highlight = data?.highlight;
      tour.termsAndCondition = data?.termsAndCondition;
      await tour.save({ transaction: t });
      await t.commit();
      return res.onSuccess(tour, {
        message: res.locals.t("common_update_success"),
      });
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async delete(id: number, user: ModelsAttributes.User, res: Response) {
    const t = await sequelize.transaction();
    try {
      let enterpriseId = user.enterpriseId || user.id;
      let whereOptions: WhereOptions = {
        id: id,
        parentLanguage: null,
        isDeleted: false,
        owner: enterpriseId,
      };

      let tour = await this.toursModel.findOne({
        where: whereOptions,
      });
      if (!tour) {
        await t.rollback();
        return res.onError({
          status: 404,
          detail: "Tour not found",
        });
      }
      tour.isDeleted = true;
      await this.toursModel.update(
        {
          isDeleted: true,
        },
        {
          where: {
            parentLanguage: id,
          },
          transaction: t,
        }
      );
      await tour.save({ transaction: t });
      await t.commit();
      return res.onSuccess({
        message: res.locals.t("common_delete_success"),
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }
}
