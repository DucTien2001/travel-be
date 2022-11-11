import { BuildOptions, Model, Sequelize } from "sequelize";
import DataType from "sequelize";

export interface HotelAttributes extends Model {
  dataValues: object;
  id: number;
  name: string;
  description: string;
  location: string;
  tags: string;
  images: string;
  creator: number;
  rate: number;
  isTemporarilyStopWorking: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export type HotelsInstance = typeof Model & {
  new (values?: object, options?: BuildOptions): HotelAttributes;
  associate?: Function;
};

export default (sequelize: Sequelize, DataTypes: typeof DataType): HotelsInstance => {
  const hotels = <HotelsInstance>sequelize.define(
    "hotels",
    {
      name: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      description: {
        allowNull: false,
        type: DataTypes.TEXT,
      },
      location: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      tags: {
        type: DataTypes.STRING,
      },
      images: {
        type: DataTypes.STRING,
      },
      creator: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      rate: {
        defaultValue: 0,
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
  hotels.associate = (models: { [key: string]: any }) => {
    hotels.belongsTo(models.users, {
      as: 'belongToUser',
      foreignKey: 'creator',
      constraints: false
    });
    hotels.hasMany(models.rooms, {
      as: 'hasManyRooms',
      foreignKey: 'hotelId',
      constraints: false
    });
  };
  return hotels;
};
