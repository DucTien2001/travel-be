import { LANG } from "common/general";
import { BuildOptions, Model, Sequelize } from "sequelize";
import DataType from "sequelize";

export interface TourOnSaleAttributes extends Model {
  dataValues: object;
  id: number;
  tourId: number;
  discount: number;
  quantity: number;
  startDate: Date;
  childrenAgeMin: number;
  childrenAgeMax: number;
  childrenPrice: number;
  adultPrice: number;
  currency: string;
  tourGuideId: number;
  isDeleted: boolean;
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date,
}

export type TourOnSalesInstance = typeof Model & {
  new (values?: object, options?: BuildOptions): TourOnSaleAttributes;
  associate?: Function;
};

export default (
  sequelize: Sequelize,
  DataTypes: typeof DataType
): TourOnSalesInstance => {
  const tour_on_sales = <TourOnSalesInstance>sequelize.define(
    "tour_on_sales",
    {
      tourId: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      discount: {
        allowNull: false,
        type: DataTypes.DOUBLE,
      },
      quantity: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      startDate: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      childrenAgeMin: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      childrenAgeMax: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      childrenPrice: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      adultPrice: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      currency: {
          type: DataTypes.STRING,
          comment: `VietNam: ${LANG.VI}, English: ${LANG.EN}`
      },
      tourGuideId: {
        type: DataTypes.INTEGER,
      },
      isDeleted: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      }
    },
    {
      paranoid: true,
    }
  );
  tour_on_sales.associate = (models: { [key: string]: any }) => {
    tour_on_sales.belongsTo(models.tours, {
      as: 'tourDetail',
      foreignKey: 'tourId',
      constraints: false
    });
    tour_on_sales.hasMany(models.tour_prices, {
      as: 'prices',
      foreignKey: 'tourOnSaleId',
      constraints: false
    });
  };
  return tour_on_sales;
};
