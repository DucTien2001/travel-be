export interface ICreateRoomBill {
  userId: number;
  userMail: string;
  rooms: {
    roomId: string;
    amount: string;
    discount: number;
    prices: number[];
    totalPrice: number;
  }[];
  bookedDates: string[];
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