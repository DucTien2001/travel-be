import { BuildOptions, Model, Sequelize } from "sequelize";
import DataType from "sequelize";

export interface RoomBillDetailAttributes extends Model {
  dataValues: object;
  id: number;
  billId: number;
  roomId: string;
  amount: number;
  discount: number;
  prices: string;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export type RoomBillDetailsInstance = typeof Model & {
  new (values?: object, options?: BuildOptions): RoomBillDetailAttributes;
  associate?: Function;
};

export default (sequelize: Sequelize, DataTypes: typeof DataType): RoomBillDetailsInstance => {
  const room_bill_details = <RoomBillDetailsInstance>sequelize.define(
    "room_bill_details",
    {
      billId: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      roomId: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      amount: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      discount: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      prices: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      totalPrice: {
        allowNull: false,
        type: DataTypes.DOUBLE,
      },
    },
    {
      paranoid: true,
    }
  );
  room_bill_details.associate = (models: { [key: string]: any }) => {
    room_bill_details.belongsTo(models.room_bills, {
      as: 'belongsToRoomBill',
      foreignKey: 'billId',
      constraints: false
    });
    room_bill_details.belongsTo(models.rooms, {
      as: 'belongsToRoom',
      foreignKey: 'roomId',
      constraints: false
    });
  };
  return room_bill_details;
};
