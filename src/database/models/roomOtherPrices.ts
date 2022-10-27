import { BuildOptions, Model, Sequelize } from "sequelize";
import DataType from "sequelize/types/lib/data-types";

export interface RoomOtherPriceAttributes extends Model {
  dataValues: object;
  id: number;
  date: Date;
  price: number;
  roomId: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export type RoomOtherPricesInstance = typeof Model & {
  new (values?: object, options?: BuildOptions): RoomOtherPriceAttributes;
  associate?: Function;
};

export default (sequelize: Sequelize, DataTypes: typeof DataType): RoomOtherPricesInstance => {
  const room_other_prices = <RoomOtherPricesInstance>sequelize.define(
    "room_other_prices",
    {
      date: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      price: {
        allowNull: false,
        type: DataTypes.DOUBLE,
      },
      roomId: {
        allowNull: false,
        type: DataTypes.INTEGER,
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
  room_other_prices.associate = (models: { [key: string]: any }) => {
    // room_other_prices.belongsTo(models.admin_types, {
    //   as: 'admin_type',
    //   foreignKey: 'adminTypeId',
    //   constraints: false
    // });
    // room_other_prices.belongsTo(models.countries, {
    //   as: 'country',
    //   foreignKey: 'countryId',
    //   constraints: false
    // });
  };
  return room_other_prices;
};
