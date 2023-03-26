export interface FindAll {
  take: number;
  page: number;
  keyword?: string;
}

export interface FindOne {
  language?: string;
}

export interface Create {
  title: string;
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

export interface Update {
  title: string;
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
  language: string;
  images: string[];
  imagesDeleted: string[];
}
