export enum NODE_ENV {
  DEVELOPMENT = "development",
  TEST = "test",
  PRODUCTION = "production",
}

export enum SEQUELIZE_SYNC {
  NO = "no",
  ALTER = "alter",
  FORCE = "force",
}

export enum ETypeUser {
  ADMIN = 1,
  ENTERPRISE = 2,
  USER = 3,
}

export enum ETypeVerifyCode {
  VERIFY_EMAIL = 1,
  RESET_PASSWORD = 2,
  FORGOT_PASSWORD = 3
}