export interface Create {
  tourId: number;
  discount: number;
  quantity: number;
  startDate: Date;
}

export interface Update {
  discount: number;
  quantity: number;
  startDate: Date;
}