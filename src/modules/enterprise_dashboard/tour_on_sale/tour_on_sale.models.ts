interface price {
  title: string;
  minOld: number;
  maxOld: number;
  price: number;
}

export interface Create {
  tourId: number;
  discount: number;
  quantity: number;
  startDate: Date;
  prices: price[];
}

export interface Update {
  discount: number;
  quantity: number;
  startDate: Date;
}