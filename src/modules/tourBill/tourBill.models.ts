export interface ICreateTourBill {
  userId: number;
  tourId: number;
  amount: number;
  price: number;
  discount: number;
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
}
