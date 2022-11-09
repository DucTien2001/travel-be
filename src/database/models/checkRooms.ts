import { BuildOptions, Model, Sequelize } from "sequelize";
import DataType from "sequelize";

export interface CheckRoomAttributes extends Model {
  id: number;
  bookedDate: Date;
  numberOfRoomsAvailable: number;
  roomId: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export type CheckRoomsInstance = typeof Model & {
  new (values?: object, options?: BuildOptions): CheckRoomAttributes;
  associate?: Function;
};

export default (sequelize: Sequelize, DataTypes: typeof DataType): CheckRoomsInstance => {
  const check_rooms = <CheckRoomsInstance>sequelize.define(
    "check_rooms",
    {
      bookedDate: {
        type: DataTypes.DATE,
      },
      numberOfRoomsAvailable: {
        type: DataTypes.INTEGER,
      },
      roomId: {
        type: DataTypes.INTEGER,
      },
    },
    {
      paranoid: true,
    }
  );
  check_rooms.associate = (models: { [key: string]: any }) => {
    // check_rooms.belongsTo(models.admin_types, {
    //   as: 'admin_type',
    //   foreignKey: 'adminTypeId',
    //   constraints: false
    // });
    // check_rooms.belongsTo(models.countries, {
    //   as: 'country',
    //   foreignKey: 'countryId',
    //   constraints: false
    // });
  };
  return check_rooms;
};
