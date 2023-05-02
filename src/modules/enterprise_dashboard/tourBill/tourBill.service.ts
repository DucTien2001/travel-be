import { Inject, Service } from "typedi";
import { FindAll, Update } from "./tourBill.models";
import { sequelize } from "database/models";
import { Response } from "express";

@Service()
export default class TourBillService {
  constructor(
    @Inject("tourBillsModel") private tourBillsModel: ModelsInstance.TourBills
  ) {}
  public async findAll(data: FindAll, user: ModelsAttributes.User, res: Response) {
    try {
      const enterpriseId = user.enterpriseId || user.id;
      const offset = data.take * (data.page - 1);
      const bills = await this.tourBillsModel.findAndCountAll({
        where: {
          tourOwnerId: enterpriseId,
        },
        limit: data.take,
        offset: offset,
        distinct: true,
      });
      if (!bills) {
        return res.onError({
          status: 404,
          detail: "not_found",
        });
      }

      // ====== Handle expiredDate =====
      // const allBills: any[] = [];
      // bills.rows.map((item) => {
      //   if (new Date().getTime() < new Date(item?.expiredDate).getTime()) {
      //     allBills.push({
      //       ...item?.dataValues,
      //     });
      //   }
      // });
      return res.onSuccess(bills.rows, {
        meta: {
          take: data.take,
          itemCount: bills.count,
          page: data.page,
          pageCount: Math.ceil(bills.count / data.take),
        },
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async findOne(billId: number, user: ModelsAttributes.User, res: Response) {
    try {
      const enterpriseId = user.enterpriseId || user.id;
      const bill = await this.tourBillsModel.findOne({
        where: {
          id: billId,
          tourOwnerId: enterpriseId,
        },
      });
      if (!bill) {
        return res.onError({
          status: 404,
          detail: "bill_not_found",
        });
      }
      return res.onSuccess(bill, {
        message: res.locals.t("get_tour_bill_success"),
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }
  public async update(billId: number, data: Update, user: ModelsAttributes.User, res: Response) {
    const t = await sequelize.transaction();
    try {
      const enterpriseId = user.enterpriseId || user.id;
      const tourBill = await this.tourBillsModel.findOne({
        where: {
          id: billId,
          tourOwnerId: enterpriseId,
        },
      });
      if (!tourBill) {
        return res.onError({
          status: 404,
          detail: "Tour bill not found",
        });
      }

      if (data?.status) {
        tourBill.status = data.status;
      }

      await tourBill.save({ transaction: t });
      await t.commit();
      return res.onSuccess(tourBill, {
        message: res.locals.t("tour_bill_update_success"),
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
