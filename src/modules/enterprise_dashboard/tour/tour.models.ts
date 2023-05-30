export enum ETourStatusFilter {
  ALL = -1,
  ACTIVED = 0,
  IN_ACTIVED = 1,
}

export interface FindAll {
  take: number;
  page: number;
  keyword?: string;
  status: ETourStatusFilter;
}

export interface FindOne {
  language?: string;
}

export interface Ilocation {
  id: number;
  name: string;
}

export interface Create {
  title: string;
  numberOfDays: number;
  numberOfNights: number;
  cityStart: Ilocation;
  districtStart: Ilocation;
  communeStart: Ilocation;
  moreLocationStart: string;
  city: Ilocation;
  district: Ilocation;
  commune: Ilocation;
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
  cityStart: Ilocation;
  districtStart: Ilocation;
  communeStart: Ilocation;
  moreLocationStart: string;
  city: Ilocation;
  district: Ilocation;
  commune: Ilocation;
  moreLocation: string;
  contact: string;
  description: string;
  suitablePerson: string;
  highlight: string;
  termsAndCondition: string;
  language: string;
  images: string[];         // mảng url image cũ
  imagesDeleted: string[];  // mảng url image bị xóa
}                           // image add mới thì gửi append file theo formData giống như lúc create
            // ví dụ ban đầu có 5 image: [1, 2, 3, 4, 5] và xóa đi image 2 và 4 thì:
            // field images: [1, 3, 5]
            // field imagesDeleted: [2, 4]