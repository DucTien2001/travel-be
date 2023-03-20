export interface FindAll {
  take: number;
  page: number;
  keyword?: string;
}

export interface Create {
  title: string;
  quantity: string;
  numberOfDays: number;
  numberOfNights: number;
  city: string;
  district: string;
  commune: string;
  moreLocation: string;
  contact: string;
  description: string;
  suitablePerson: string;
  highlight: string;
  termsAndCondition: string;
}