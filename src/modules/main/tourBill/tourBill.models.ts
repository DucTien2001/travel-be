export interface ICreateTourBill {
  userId: number;
  userMail: string;
  tourId: number;
  amount: number;
  price: number;
  discount: number;
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  bankName: string;
  bankAccountName: string;
  bankNumber: string;
  accountExpirationDate: Date;
  deposit: number;
}

export interface IVerifyBookTour {
  code: string;
  billId: number;
}

export interface IGetToursRevenueByMonth {
  tourIds: number[];
  month: number;
  year: number;
}

export interface IGetToursRevenueByYear {
  tourIds: number[];
  year: number;
}

export interface IGetAllTourBillsAnyDate {
  tourIds: number[];
  date: Date;
}