import { Inject, Service } from "typedi";
import { Create, Update } from "./policy.models";
import { Response } from "express";
import { sequelize } from "database/models";

@Service()
export default class PolicyService {
  constructor(@Inject("policiesModel") private policiesModel: ModelsInstance.Policies) {}
  public async create(data: Create, res: Response) {
    const t = await sequelize.transaction();
    try {
      const policy = await this.policiesModel.create(
        {
          serviceId: data?.serviceId,
          serviceType: data?.serviceType,
          policyType: data?.policyType,
          dayRange: data?.dayRange,
          moneyRate: data?.moneyRate,
        },
        {
          transaction: t,
        }
      );
      await t.commit();
      return res.onSuccess(policy, {
        message: res.locals.t("policy_create_success"),
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
      const policy = await this.policiesModel.findOne({
        where: {
          id: id,
        },
      });
      if (!policy) {
        return res.onError({
          status: 404,
          detail: res.locals.t("common_not_found"),
        });
      }
      policy.policyType = data.policyType;
      policy.dayRange = data.dayRange;
      policy.moneyRate = data.moneyRate;
      await policy.save();
      await t.commit();
      return res.onSuccess(policy, {
        message: res.locals.t("policy_update_success"),
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
      const policy = await this.policiesModel.findOne({
        where: {
          id: id,
        },
      });
      if (!policy) {
        return res.onError({
          status: 404,
          detail: res.locals.t("common_not_found"),
        });
      }
      await policy.destroy({ transaction: t })
      await t.commit();
      return res.onSuccess(policy, {
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
