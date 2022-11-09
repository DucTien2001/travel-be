export interface ITour {
  avatar: string;
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
  avatar: string;
  title: string;
  description: string;
  businessHours: string;
  location: string;
  price: number;
  discount: number;
  tags: string;
  images: string;
}
