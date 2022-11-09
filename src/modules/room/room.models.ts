export interface ICreateRoom {
  title: string;
  description: string;
  location: string;
  discount: number;
  tags: string;
  images: string;
  numberOfBed: number;
  numberOfRoom: number;
  mondayPrice: number;
  tuesdayPrice: number;
  wednesdayPrice: number;
  thursdayPrice: number;
  fridayPrice: number;
  saturdayPrice: number;
  sundayPrice: number;
  creator: number;
}

export interface IUpdateRoomInfo {
  title: string;
  description: string;
  location: string;
  tags: string;
  images: string;
  numberOfBed: number;
  numberOfRoom: number;
}

export interface IUpdateRoomPrice {
  discount: number;
  mondayPrice: number;
  tuesdayPrice: number;
  wednesdayPrice: number;
  thursdayPrice: number;
  fridayPrice: number;
  saturdayPrice: number;
  sundayPrice: number;
}
