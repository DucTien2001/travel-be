export interface ICreateRoomBill {
  userId: number;
  rooms: {
    roomId: string;
    amount: string;
    discount: number;
  }[];
  bookedDates: string;
  specialDates: string;
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
}
