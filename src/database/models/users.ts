import { BuildOptions, Model, Sequelize } from "sequelize";
import DataType from "sequelize";
import { ETypeUser } from "common/general";

export interface UserAttributes extends Model {
  id: number;
  username: string;
  password: string;
  role: ETypeUser;
  avatar: string;
  firstName: string;
  lastName: string;
  address: string;
  phoneNumber: string;
  introduction: string;
  isDeleted: boolean;
  isVerified: boolean;
  tokenVerify: string;
  rate: number;
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
      introduction: {
        type: DataTypes.TEXT,
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
      rate: {
        defaultValue: 0,
        type: DataTypes.DOUBLE,
      },
    },
    {
      paranoid: true,
    }
  );
  users.associate = (models: { [key: string]: any }) => {
    // users.belongsTo(models.admin_types, {
    //   as: 'admin_type',
    //   foreignKey: 'adminTypeId',
    //   constraints: false
    // });
    // users.belongsTo(models.countries, {
    //   as: 'country',
    //   foreignKey: 'countryId',
    //   constraints: false
    // });
  };
  return users;
};
