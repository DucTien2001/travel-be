export enum ERoomStatusFilter {
  ALL = -1,
  ACTIVED = 0,
  IN_ACTIVED = 1,
}

export interface FindAll {
  take: number;
  page: number;
  keyword?: string;
  status: ERoomStatusFilter;
}

export interface FindOne {
  language?: string;
}

export interface Create {
  title: string;
  description: string;
  utility: string;
  numberOfAdult: number;
  numberOfChildren: number;
  numberOfBed: number;
  numberOfRoom: number;
  discount: number;
  mondayPrice: number;
  tuesdayPrice: number;
  wednesdayPrice: number;
  thursdayPrice: number;
  fridayPrice: number;
  saturdayPrice: number;
  sundayPrice: number;
  stayId: number;
}

export interface Update {
  title: string;
  description: string;
  utility: string;
  numberOfAdult: number;
  numberOfChildren: number;
  numberOfBed: number;
  numberOfRoom: number;
  discount: number;
  mondayPrice: number;
  tuesdayPrice: number;
  wednesdayPrice: number;
  thursdayPrice: number;
  fridayPrice: number;
  saturdayPrice: number;
  sundayPrice: number;
  language: string;
} 