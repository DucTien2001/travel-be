export interface ITour {
  title: string;
  description: string;
  businessHours: string;
  location: string;
  price: number;
  discount: number;
  tags: string;
  images: string;
  rate: number;
  creator: number;
  isTemporarilyStopWorking: boolean;
  isDeleted: boolean;
}

export interface IUpdateTour {
  title: string;
  description: string;
  businessHours: string;
  location: string;
  price: number;
  discount: number;
  tags: string;
  images: string;
}
