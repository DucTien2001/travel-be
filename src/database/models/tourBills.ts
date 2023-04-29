import { EPaymentStatus } from "models/general";
import { BuildOptions, Model, Sequelize } from "sequelize";
import DataType from "sequelize";

export interface TourBillAttributes extends Model {
  id: number;
  userId: number;
  tourId: number;
  tourOnSaleId: number;
  amountChild: number;
  amountAdult: number;
  price: number;
  discount: number;
  totalBill: number;
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  tourData: ModelsAttributes.Tour;
  tourOnSaleData: ModelsAttributes.TourOnSale;
  status: EPaymentStatus;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  participantsInfo: any;
  expiredTime: Date;
  isReScheduled: boolean;
  oldBillId: number;
  oldBillData: ModelsAttributes.TourBill;
  isCanceled: boolean;
  moneyRefund: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export type TourBillsInstance = typeof Model & {
  new (values?: object, options?: BuildOptions): TourBillAttributes;
  // eslint-disable-next-line @typescript-eslint/ban-types
  associate?: Function;
};

export default (sequelize: Sequelize, DataTypes: typeof DataType): TourBillsInstance => {
  const tour_bills = <TourBillsInstance>sequelize.define(
    "tour_bills",
    {
      userId: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      tourId: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      tourOnSaleId: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      amountChild: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      amountAdult: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      price: {
        allowNull: false,
        type: DataTypes.DOUBLE,
      },
      discount: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      totalBill: {
        allowNull: false,
        type: DataTypes.DOUBLE,
      },
      email: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      phoneNumber: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      firstName: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      lastName: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      tourData: {
        type: DataTypes.TEXT({ length: "long" }),
        allowNull: false,
        get() {
          return JSON.parse(this.getDataValue("tourData") || "{}");
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        set(value: any) {
          this.setDataValue("tourData", JSON.stringify(value || {}));
        },
      },
      tourOnSaleData: {
        type: DataTypes.TEXT({ length: "long" }),
        allowNull: false,
        get() {
          return JSON.parse(this.getDataValue("tourOnSaleData") || "{}");
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        set(value: any) {
          this.setDataValue("tourOnSaleData", JSON.stringify(value || {}));
        },
      },
      participantsInfo: {
        type: DataTypes.TEXT({ length: "long" }),
        get() {
          return JSON.parse(this.getDataValue("participantsInfo") || "{}");
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        set(value: any) {
          this.setDataValue("participantsInfo", JSON.stringify(value || {}));
        },
      },
      status: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      isReScheduled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      expiredTime: {
        type: DataTypes.DATE,
      },
      oldBillData: {
        type: DataTypes.TEXT({ length: "long" }),
        get() {
          return JSON.parse(this.getDataValue("oldBillData") || "{}");
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        set(value: any) {
          this.setDataValue("oldBillData", JSON.stringify(value || {}));
        },
      },
      isCanceled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      moneyRefund: {
        type: DataTypes.DOUBLE,
      },
    },
    {
      paranoid: true,
    }
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tour_bills.associate = (models: { [key: string]: any }) => {
    tour_bills.belongsTo(models.tours, {
      as: "tourInfo",
      foreignKey: "tourId",
      constraints: false,
    });
    tour_bills.belongsTo(models.users, {
      as: "userInfo",
      foreignKey: "userId",
      constraints: false,
    });
  };
  return tour_bills;
};
