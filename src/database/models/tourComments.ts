import { BuildOptions, Model, Sequelize } from "sequelize";
import DataType from "sequelize";

export interface TourCommentAttributes extends Model {
  dataValues: any;
  id: number;
  tourId: number;
  userId: number;
  comment: string;
  rate: number;
  replyComment: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export type TourCommentsInstance = typeof Model & {
  new (values?: object, options?: BuildOptions): TourCommentAttributes;
  associate?: Function;
};

export default (sequelize: Sequelize, DataTypes: typeof DataType): TourCommentsInstance => {
  const tour_comments = <TourCommentsInstance>sequelize.define(
    "tour_comments",
    {
      comment: {
        type: DataTypes.TEXT,
      },
      replyComment: {
        type: DataTypes.TEXT,
      },
      rate: {
        type: DataTypes.INTEGER,
      },
      tourId: {
        type: DataTypes.INTEGER,
      },
      userId: {
        type: DataTypes.INTEGER,
      },
    },
    {
      paranoid: true,
    }
  );
  tour_comments.associate = (models: { [key: string]: any }) => {
    tour_comments.belongsTo(models.tours, {
      as: 'belongToTour',
      foreignKey: 'tourId',
      constraints: false
    });
    tour_comments.belongsTo(models.users, {
      as: 'belongToUser',
      foreignKey: 'userId',
      constraints: false
    });
  };
  return tour_comments;
};
