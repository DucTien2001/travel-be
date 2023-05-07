export interface FindAll {
  take: number;
  page: number;
  keyword?: string;
}

export interface Update {
  status: number;
}

export interface StatisticAll {
  take: number;
  page: number;
  keyword?: string;
  month: number;
  year: number;
}

export interface StatisticOneTour {
  take: number;
  page: number;
  month: number;
  year: number;
}
