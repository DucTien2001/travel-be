export interface ICreateRoomBill {
  userId: number;
  hotelId: number;
  userMail: string;
  rooms: {
    roomId: string;
    amount: string;
    discount: number;
    price: number;
    bookedDate?: Date;
    totalPrice: number;
  }[];
  bookedDates: string;
  startDate: Date;
  endDate: Date;
  totalBill: number;
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
}

export interface IVerifyBookRoom {
  code: string;
  billId: number;
}

export interface IGetHotelsRevenueByMonth {
  hotelIds: number[];
  month: number;
  year: number;
}

export interface IGetHotelsRevenueByYear {
  hotelIds: number[];
  year: number;
}