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

export interface IReSendVerifySignup {
  email: string;
}

export interface ISendEmailForgotPassword {
  email: string;
}

export interface IChangePassword {
  userId: number;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface IChangePassForgot {
  email: string;
  code: string;
  password: string;
  confirmPassword: string;
}

export interface IUpdateUserProfile {
  avatar: string;
  firstName: string;
  lastName: string;
  address: string;
  phoneNumber: string;
}



export interface ChangeLanguage {
  language: string
}