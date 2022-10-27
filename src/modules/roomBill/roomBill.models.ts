export interface ICreateRoomBill {
  userId: number;
  roomId: number;
  bookedDates: string;
  specialDates: string;
  amount: number;
  discount: number;
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
}
