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
  isRequestDelete: boolean;
  reasonForDelete: string;
  isDecline: boolean;
  reasonForDecline: string;
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
      isRequestDelete: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      reasonForDelete: {
        type: DataTypes.TEXT,
      },
      isDecline: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      reasonForDecline: {
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
      as: 'tourInfo',
      foreignKey: 'tourId',
      constraints: false
    });
    tour_comments.belongsTo(models.users, {
      as: 'tourReviewer',
      foreignKey: 'userId',
      constraints: false
    });
  };
  return tour_comments;
};
