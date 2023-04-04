import { Inject, Service } from "typedi";
import { Create, ITourOnSale, Update } from "./tour_on_sale.models";
import { Response } from "express";
import { sequelize } from "database/models";

@Service()
export default class TourOnSaleService {
  constructor(
    @Inject("tourOnSalesModel") private tourOnSalesModel: ModelsInstance.TourOnSales,
    @Inject("tourPricesModel") private tourPricesModel: ModelsInstance.TourPrices
  ) {}
  public async create(data: Create, res: Response) {
    const t = await sequelize.transaction();
    try {
      const tourOnSale = await this.tourOnSalesModel.create(
        {
          tourId: data?.tourId,
          discount: data?.discount || 0,
          quantity: data?.quantity,
          startDate: data?.startDate,
          childrenAgeMin: data?.quantity,
          childrenAgeMax: data?.startDate,
          childrenPrice: data?.quantity,
          adultPrice: data?.startDate,
          currency: data?.startDate,
        },
        {
          transaction: t,
        }
      );
      await t.commit();
      return res.onSuccess(tourOnSale, {
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

  public async update(id: number, data: Update, res: Response) {
    const t = await sequelize.transaction();
    try {
      const tourOnSale = await this.tourOnSalesModel.findOne({
        where: {
          id: id,
        },
      });
      if (!tourOnSale) {
        return res.onError({
          status: 404,
          detail: res.locals.t("common_not_found"),
        });
      }
      tourOnSale.discount = data.discount || 0;
      tourOnSale.quantity = data.quantity || 0;
      tourOnSale.startDate = data.startDate || new Date();
      tourOnSale.childrenAgeMin = data.childrenAgeMin;
      tourOnSale.childrenAgeMax = data.childrenAgeMax;
      tourOnSale.childrenPrice = data.childrenPrice;
      tourOnSale.adultPrice = data.adultPrice;
      tourOnSale.currency = data.currency;
      await tourOnSale.save();
      await t.commit();
      return res.onSuccess(tourOnSale, {
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

  public async createOrUpdate(data: ITourOnSale[], res: Response) {
    const t = await sequelize.transaction();
    try {
      const dataCreate: ITourOnSale[] = [];
      const dataUpdate: ITourOnSale[] = [];
      data.forEach((item) => {
        if (item?.id) {
          dataUpdate.push(item);
        } else {
          dataCreate.push(item);
        }
      });

      await this.tourOnSalesModel.bulkCreate(dataCreate, {
        transaction: t,
      });

      await Promise.all(
        dataUpdate.map(
          async (item) =>
            await this.tourOnSalesModel.update(
              {
                discount: item?.discount,
                quantity: item?.quantity,
                startDate: item?.startDate,
                childrenAgeMin: item?.childrenAgeMin,
                childrenAgeMax: item?.childrenAgeMax,
                childrenPrice: item?.childrenPrice,
                adultPrice: item?.adultPrice,
                currency: item?.currency,
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

      await t.commit();
      return res.onSuccess({
        message: res.locals.t("common_success"),
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
