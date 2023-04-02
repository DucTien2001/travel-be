interface price {
  id?: number;
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
  childrenAgeMin: number;
  childrenAgeMax: number;
  childrenPrice: number;
  adultPrice: number;
  currency: string;
}

export interface Update {
  discount: number;
  quantity: number;
  startDate: Date;
  childrenAgeMin: number;
  childrenAgeMax: number;
  childrenPrice: number;
  adultPrice: number;
  currency: string;
}