import { BuildOptions, Model, Sequelize } from "sequelize";
import DataType from "sequelize";

export interface RoomAttributes extends Model {
  dataValues: object;
  id: number;
  title: string;
  description: string;
  discount: number;
  tags: string;
  images: string;
  hotelId: number;
  numberOfBed: number;
  numberOfRoom: number;
  mondayPrice: number;
  tuesdayPrice: number;
  wednesdayPrice: number;
  thursdayPrice: number;
  fridayPrice: number;
  saturdayPrice: number;
  sundayPrice: number;
  isTemporarilyStopWorking: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export type RoomsInstance = typeof Model & {
  new (values?: object, options?: BuildOptions): RoomAttributes;
  associate?: Function;
};

export default (sequelize: Sequelize, DataTypes: typeof DataType): RoomsInstance => {
  const rooms = <RoomsInstance>sequelize.define(
    "rooms",
    {
      title: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      description: {
        allowNull: false,
        type: DataTypes.TEXT,
      },
      discount: {
        allowNull: false,
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      tags: {
        type: DataTypes.STRING,
      },
      images: {
        type: DataTypes.STRING,
      },
      hotelId: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      numberOfBed: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      numberOfRoom: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      mondayPrice: {
        allowNull: false,
        type: DataTypes.DOUBLE,
      },
      tuesdayPrice: {
        allowNull: false,
        type: DataTypes.DOUBLE,
      },
      wednesdayPrice: {
        allowNull: false,
        type: DataTypes.DOUBLE,
      },
      thursdayPrice: {
        allowNull: false,
        type: DataTypes.DOUBLE,
      },
      fridayPrice: {
        allowNull: false,
        type: DataTypes.DOUBLE,
      },
      saturdayPrice: {
        allowNull: false,
        type: DataTypes.DOUBLE,
      },
      sundayPrice: {
        allowNull: false,
        type: DataTypes.DOUBLE,
      },
      isTemporarilyStopWorking: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isDeleted: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      paranoid: true,
    }
  );
  rooms.associate = (models: { [key: string]: any }) => {
    // rooms.belongsTo(models.admin_types, {
    //   as: 'admin_type',
    //   foreignKey: 'adminTypeId',
    //   constraints: false
    // });
    // rooms.belongsTo(models.countries, {
    //   as: 'country',
    //   foreignKey: 'countryId',
    //   constraints: false
    // });
  };
  return rooms;
};
