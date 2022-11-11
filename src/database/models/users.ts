import { BuildOptions, Model, Sequelize } from "sequelize";
import DataType from "sequelize";
import { ETypeUser } from "common/general";

export interface UserAttributes extends Model {
  dataValues: any;
  id: number;
  username: string;
  password: string;
  role: ETypeUser;
  avatar: string;
  firstName: string;
  lastName: string;
  address: string;
  phoneNumber: string;
  isDeleted: boolean;
  isVerified: boolean;
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date,
}

export type UsersInstance = typeof Model & {
  new (values?: object, options?: BuildOptions): UserAttributes;
  associate?: Function;
};

export default (
  sequelize: Sequelize,
  DataTypes: typeof DataType
): UsersInstance => {
  const users = <UsersInstance>sequelize.define(
    "users",
    {
      username: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      password: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      role: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      avatar: {
        type: DataTypes.STRING,
      },
      firstName: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      lastName: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      address: {
        type: DataTypes.STRING,
      },
      phoneNumber: {
        type: DataTypes.STRING,
      },
      isDeleted: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isVerified: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      paranoid: true,
    }
  );
  users.associate = (models: { [key: string]: any }) => {
    users.hasMany(models.tours, {
      as: 'ownTours',
      foreignKey: 'creator',
      constraints: false
    });
    users.hasMany(models.hotels, {
      as: 'ownHotels',
      foreignKey: 'creator',
      constraints: false
    });
    users.hasMany(models.tour_bills, {
      as: 'bookTours',
      foreignKey: 'userId',
      constraints: false
    });
    users.hasMany(models.room_bills, {
      as: 'bookRooms',
      foreignKey: 'userId',
      constraints: false
    });
  };
  return users;
};
