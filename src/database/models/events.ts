import { BuildOptions, Model, Sequelize } from "sequelize";
import DataType from "sequelize";
import { LANG } from "common/general";

export interface EventAttributes extends Model {
  dataValues: object;
  id: number;
  name: string;
  description: string;
  startTime: Date;
  endTime: Date;
  banner: string;
  code: string;
  policy: string;
  hotelIds: number[];
  tourIds: number[];
  numberOfCodes: number;
  numberOfCodesUsed: number;
  creator: number;
  owner: number;
  isDeleted: boolean;
  parentLanguage: number;
  language: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export type EventsInstance = typeof Model & {
  new (values?: object, options?: BuildOptions): EventAttributes;
  associate?: Function;
};

export default (sequelize: Sequelize, DataTypes: typeof DataType): EventsInstance => {
  const events = <EventsInstance>sequelize.define(
    "events",
    {
      name: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      description: {
        allowNull: false,
        type: DataTypes.TEXT,
      },
      startTime: {
        type: DataTypes.DATE,
      },
      endTime: {
        type: DataTypes.DATE,
      },
      banner: {
        type: DataTypes.STRING,
      },
      code: {
        type: DataTypes.STRING,
      },
      policy: {
        allowNull: false,
        type: DataTypes.TEXT,
      },
      hotelIds: {
        type: DataTypes.TEXT({ length: "long" }),
        get() {
          return JSON.parse(this.getDataValue("hotelIds") || "[]");
        },
        set(value: any) {
          this.setDataValue("hotelIds", JSON.stringify(value || []));
        },
        comment: `All: [-1]`,
      },
      tourIds: {
        type: DataTypes.TEXT({ length: "long" }),
        get() {
          return JSON.parse(this.getDataValue("tourIds") || "[]");
        },
        set(value: any) {
          this.setDataValue("tourIds", JSON.stringify(value || []));
        },
        comment: `All: [-1]`,
      },
      numberOfCodes: {
        type: DataTypes.INTEGER,
      },
      numberOfCodesUsed: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      creator: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      owner: {
        type: DataTypes.INTEGER,
        comment: `Admin: null`,
      },
      isDeleted: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      parentLanguage: {
        type: DataTypes.INTEGER,
      },
      language: {
        type: DataTypes.STRING,
        comment: `VietNam: ${LANG.VI}, English: ${LANG.EN}`,
      },
    },
    {
      paranoid: true,
    }
  );
  events.associate = (models: { [key: string]: any }) => {
    events.hasMany(models.events, {
      as: "languages",
      foreignKey: "parentLanguage",
      constraints: false,
    });
  };
  return events;
};
