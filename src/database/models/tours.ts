import { BuildOptions, Model, Sequelize } from "sequelize";
import DataType from "sequelize";

export interface TourAttributes extends Model {
  dataValues: object;
  id: number;
  title: string;
  description: string;
  businessHours: string;
  location: string;
  price: number;
  discount: number;
  tags: string;
  images: string;
  rate: number;
  creator: number;
  isTemporarilyStopWorking: boolean;
  isDeleted: boolean;
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date,
}

export type ToursInstance = typeof Model & {
  new (values?: object, options?: BuildOptions): TourAttributes;
  associate?: Function;
};

export default (
  sequelize: Sequelize,
  DataTypes: typeof DataType
): ToursInstance => {
  const tours = <ToursInstance>sequelize.define(
    "tours",
    {
      title: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      description: {
        allowNull: false,
        type: DataTypes.TEXT,
      },
      businessHours: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      location: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      price: {
        allowNull: false,
        type: DataTypes.DOUBLE,
      },
      discount: {
        allowNull: false,
        type: DataTypes.DOUBLE,
      },
      tags: {
        type: DataTypes.STRING,
      },
      images: {
        type: DataTypes.STRING,
      },
      rate: {
        defaultValue: 0,
        type: DataTypes.DOUBLE,
      },
      creator: {
        allowNull: false,
        type: DataTypes.INTEGER,
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
  tours.associate = (models: { [key: string]: any }) => {
    tours.belongsTo(models.users, {
      as: 'belongToUser',
      foreignKey: 'creator',
      constraints: false
    });
    tours.hasMany(models.tour_bills, {
      as: 'bookedTour',
      foreignKey: 'tourId',
      constraints: false
    });
  };
  return tours;
};
