import { Inject, Service } from "typedi";
import { Create, FindAll } from "./tour.models";
import { Response } from "express";
import { WhereOptions } from "sequelize";
import { sequelize } from "database/models";
import FileService, { FileUploaded } from "services/file";

@Service()
export default class TourService {
  constructor(@Inject("toursModel") private toursModel: ModelsInstance.Tours) {}
  /**
   * Find all
   */
  public async findAll(data: FindAll, res: Response) {
    try {
      let whereOptions: WhereOptions = {
        parentLanguage: null,
        isTemporarilyStopWorking: false,
        isDeleted: false,
      }

      let offset = (data.take) * (data.page - 1);
      
      const listTours = await this.toursModel.findAndCountAll({
        where: whereOptions,
        include: [
          {
            association: 'languages'
          }
        ],
        limit: data.take,
        offset: offset,
        distinct: true
      });
      
      return res.onSuccess(listTours.rows, {
        meta: {
          take: data.take,
          itemCount: listTours.count,
          page: data.page,
          pageCount: Math.ceil(listTours.count / (data.take))
        }
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }
  
  public async create(data: Create, files: Express.Multer.File[], user: ModelsAttributes.User, res: Response) {
    const t = await sequelize.transaction();
    let fileUploadeds: FileUploaded[] = []
    try {
      const image = (await FileService.uploadAttachments([(files || []).find(temp => temp.fieldname === 'image')]))[0]
      if (!image) {
        await t.rollback()
        return res.onError({
          status: 400,
          detail: 'Image is required'
        })
      }
      fileUploadeds = fileUploadeds.concat(image)

      const newTour = await this.toursModel.create(
        {
          title: data?.title,
          quantity: data?.quantity,
          numberOfDays: data?.numberOfDays || "",
          numberOfNights: data?.numberOfNights,
          images: image?.url,
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
          isTemporarilyStopWorking: false,
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
}
