import { BuildOptions, Model, Sequelize } from "sequelize";
import DataType from "sequelize";

export interface RoomBillAttributes extends Model {
  dataValues: any;
  id: number;
  userId: number;
  hotelId: number;
  bookedDates: string;
  startDate: string;
  endDate: string;
  email: string;
  phoneNumber: string;
  fistName: string;
  lastName: string;
  totalBill: number;
  bankName: string;
  bankAccountName: string;
  bankNumber: string;
  accountExpirationDate: Date;
  deposit: number;
  verifyCode: string;
  expiredDate: Date;
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
      hotelId: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      bookedDates: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      startDate: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      endDate: {
        allowNull: false,
        type: DataTypes.DATE,
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
      totalBill: {
        allowNull: false,
        type: DataTypes.DOUBLE,
      },
      bankName: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      bankAccountName: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      bankNumber: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      deposit: {
        allowNull: false,
        type: DataTypes.DOUBLE,
      },
      accountExpirationDate: {
        type: DataTypes.DATE,
      },
      verifyCode: {
        type: DataTypes.STRING,
      },
      expiredDate: {
          type: DataTypes.DATE,
      },
    },
    {
      paranoid: true,
    }
  );
  room_bills.associate = (models: { [key: string]: any }) => {
    room_bills.belongsTo(models.users, {
      as: 'userInfo',
      foreignKey: 'userId',
      constraints: false
    });
    room_bills.belongsTo(models.hotels, {
      as: 'hotelInfo',
      foreignKey: 'hotelId',
      constraints: false
    });
    room_bills.hasMany(models.room_bill_details, {
      as: 'roomBillDetail',
      foreignKey: 'billId',
      constraints: false
    });
  };
  return room_bills;
};
