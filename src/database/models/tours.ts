import { BuildOptions, Model, Sequelize } from "sequelize";
import DataType from "sequelize";
import { LANG } from "common/general";

export interface TourAttributes extends Model {
  dataValues: object;
  id: number;
  title: string;
  images: string[];
  numberOfDays: number;
  numberOfNights: number;
  city: string;
  district: string;
  commune: string;
  moreLocation: string;
  contact: string;
  description: string;
  suitablePerson: string;
  highlight: string;
  termsAndCondition: string;
  numberOfReviewer: number;
  rate: number;
  policyId: number;
  creator: number;
  owner: number;
  isDeleted: boolean;
  parentLanguage: number;
  language: string;
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
      images: {
        type: DataTypes.TEXT({ length: 'long' }),
        get() {
            return JSON.parse(this.getDataValue('images') || "[]");
        },
        set(value: any) {
            this.setDataValue('images', JSON.stringify(value || []));
        }
      },
      numberOfDays: {
        type: DataTypes.INTEGER,
      },
      numberOfNights: {
        type: DataTypes.INTEGER,
      },
      city: {
        type: DataTypes.STRING,
      },
      district: {
        type: DataTypes.STRING,
      },
      commune: {
        type: DataTypes.STRING,
      },
      moreLocation: {
        type: DataTypes.STRING,
      },
      contact: {
        type: DataTypes.STRING,
      },
      description: {
        allowNull: false,
        type: DataTypes.TEXT,
      },
      suitablePerson: {
        allowNull: false,
        type: DataTypes.TEXT,
        get() {
            return JSON.parse(this.getDataValue('suitablePerson') || "[]");
        },
        set(value: any) {
            this.setDataValue('suitablePerson', JSON.stringify(value || []));
        }
      },
      highlight: {
        allowNull: false,
        type: DataTypes.TEXT,
      },
      termsAndCondition: {
        allowNull: false,
        type: DataTypes.TEXT,
      },
      policyId: {
        type: DataTypes.INTEGER,
      },
      rate: {
        defaultValue: 0,
        type: DataTypes.DOUBLE,
      },
      numberOfReviewer: {
        defaultValue: 0,
        type: DataTypes.INTEGER,
      },
      creator: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      owner: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      isDeleted: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      parentLanguage: {
          type: DataTypes.INTEGER
      },
      language: {
          type: DataTypes.STRING,
          comment: `VietNam: ${LANG.VI}, English: ${LANG.EN}`
      }
    },
    {
      paranoid: true,
    }
  );
  tours.associate = (models: { [key: string]: any }) => {
    tours.hasMany(models.tours, {
      as: 'languages',
      foreignKey: 'parentLanguage',
      constraints: false
    })
    tours.belongsTo(models.users, {
      as: 'tourCreator',
      foreignKey: 'creator',
      constraints: false
    });
    tours.belongsTo(models.users, {
      as: 'tourOwner',
      foreignKey: 'owner',
      constraints: false
    });
    tours.hasMany(models.tour_bills, {
      as: 'bookedTour',
      foreignKey: 'tourId',
      constraints: false
    });
    tours.hasMany(models.policies, {
      as: 'policies',
      foreignKey: 'policyId',
      constraints: false
    });
  };
  return tours;
};
