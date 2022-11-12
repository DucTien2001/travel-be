export interface ITour {
  title: string;
  description: string;
  businessHours: string;
  location: string;
  price: number;
  discount: number;
  tags: string;
  images: string;
  creator: number;
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
