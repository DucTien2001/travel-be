import { Inject, Service } from "typedi";
import { Create, Update } from "./tour_on_sale.models";
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
          childrenAgeMin: data?.childrenAgeMin,
          childrenAgeMax: data?.childrenAgeMax,
          childrenPrice: data?.childrenPrice,
          adultPrice: data?.adultPrice,
          currency: data?.currency,
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
      tourOnSale.childrenAgeMin = data.childrenAgeMin
      tourOnSale.childrenAgeMax = data.childrenAgeMax
      tourOnSale.childrenPrice = data.childrenPrice
      tourOnSale.adultPrice = data.adultPrice
      tourOnSale.currency = data.currency
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
}
