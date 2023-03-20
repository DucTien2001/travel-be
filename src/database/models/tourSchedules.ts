import { BuildOptions, Model, Sequelize } from "sequelize";
import DataType from "sequelize";

export interface TourScheduleAttributes extends Model {
  dataValues: object;
  id: number;
  tourId: number;
  day: number;
  startTime: Date;
  endTime: Date;
  description: string;
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date,
}

export type TourSchedulesInstance = typeof Model & {
  new (values?: object, options?: BuildOptions): TourScheduleAttributes;
  associate?: Function;
};

export default (
  sequelize: Sequelize,
  DataTypes: typeof DataType
): TourSchedulesInstance => {
  const tour_schedules = <TourSchedulesInstance>sequelize.define(
    "tour_schedules",
    {
      tourId: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      day: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      startTime: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      endTime: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      description: {
        allowNull: false,
        type: DataTypes.TEXT,
      }
    },
    {
      paranoid: true,
    }
  );
  tour_schedules.associate = (models: { [key: string]: any }) => {
    tour_schedules.belongsTo(models.tours, {
      as: 'scheduleItem',
      foreignKey: 'tourId',
      constraints: false
    });
  };
  return tour_schedules;
};
