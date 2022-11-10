export interface IRegister {
  username: string;
  password: string;
  confirmPassword: string;
  role: number;
  avatar: string;
  firstName: string;
  lastName: string;
  address: string;
  phoneNumber: string;
  introduction: string;
  isDeleted: boolean;
  isVerified: boolean;
}

export interface ILogin {
  username: string;
  password: string;
  role: number;
}

export interface IVerifySignup {
  code: string;
  userId: number;
}
