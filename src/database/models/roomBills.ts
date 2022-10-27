import { BuildOptions, Model, Sequelize } from "sequelize";
import DataType from "sequelize/types/lib/data-types";

export interface RoomBillAttributes extends Model {
  dataValues: object;
  id: number;
  userId: number;
  roomId: number;
  bookedDates: string;
  email: string;
  phoneNumber: string;
  fistName: string;
  lastName: string;
  amount: number;
  discount: number;
  totalBill: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export type RoomBillsInstance = typeof Model & {
  new (values?: object, options?: BuildOptions): RoomBillAttributes;
  associate?: Function;
};

export default (sequelize: Sequelize, DataTypes: typeof DataType): RoomBillsInstance => {
  const room_bills = <RoomBillsInstance>sequelize.define(
    "room_bills",
    {
      userId: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      tourId: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      bookedDates: {
        allowNull: false,
        type: DataTypes.STRING,
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
      amount: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      discount: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      totalBill: {
        allowNull: false,
        type: DataTypes.DOUBLE,
      },
    },
    {
      paranoid: true,
    }
  );
  room_bills.associate = (models: { [key: string]: any }) => {
    // room_bills.belongsTo(models.admin_types, {
    //   as: 'admin_type',
    //   foreignKey: 'adminTypeId',
    //   constraints: false
    // });
    // room_bills.belongsTo(models.countries, {
    //   as: 'country',
    //   foreignKey: 'countryId',
    //   constraints: false
    // });
  };
  return room_bills;
};
