export enum ESortRoomBillOption {
  LOWEST_REVENUE = 0,
  HIGHEST_REVENUE,
}

export interface StatisticAllUsers {
  take: number;
  page: number;
  month: number;
  year: number;
  keyword?: string;
  sort?: number; //ESortRoomBillOption
}

export interface StatisticOneUser {
  take: number;
  page: number;
  keyword?: string;
  month: number;
  year: number;
}

export interface StatisticOneStay {
  take: number;
  page: number;
  month: number;
  year: number;
}

export interface StatisticRoom {
  month: number;
  year: number;
}
