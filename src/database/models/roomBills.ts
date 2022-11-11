import { BuildOptions, Model, Sequelize } from "sequelize";
import DataType from "sequelize";

export interface RoomBillAttributes extends Model {
  dataValues: object;
  id: number;
  userId: number;
  roomIds: string;
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
      roomIds: {
        allowNull: false,
        type: DataTypes.STRING,
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
    room_bills.belongsTo(models.users, {
      as: 'bookedRoom',
      foreignKey: 'userId',
      constraints: false
    });
  };
  return room_bills;
};
