import { BuildOptions, Model, Sequelize } from "sequelize";
import DataType from "sequelize";

export interface TourBillAttributes extends Model {
  dataValues: object;
  id: number;
  userId: number;
  tourId: number;
  amount: number;
  price: number;
  discount: number;
  totalBill: number;
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export type TourBillsInstance = typeof Model & {
  new (values?: object, options?: BuildOptions): TourBillAttributes;
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
      amount: {
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
    },
    {
      paranoid: true,
    }
  );
  tour_bills.associate = (models: { [key: string]: any }) => {
    // tour_bills.belongsTo(models.admin_types, {
    //   as: 'admin_type',
    //   foreignKey: 'adminTypeId',
    //   constraints: false
    // });
    // tour_bills.belongsTo(models.countries, {
    //   as: 'country',
    //   foreignKey: 'countryId',
    //   constraints: false
    // });
  };
  return tour_bills;
};
