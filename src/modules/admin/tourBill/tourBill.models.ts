export enum ESortTourBillOption {
  LOWEST_REVENUE = 0,
  HIGHEST_REVENUE,
}

export interface StatisticByUser {
  take: number;
  page: number;
  month: number;
  year: number;
  keyword?: string;
  sort?: number; //ESortTourBillOption
}

export interface StatisticByTour {
  take: number;
  page: number;
  month: number;
  year: number;
  keyword?: string;
}

export interface StatisticByTourOnSale {
  take: number;
  page: number;
  month: number;
  year: number;
}

export interface GetAllBillOfOneTourOnSale {
  take: number;
  page: number;
}
