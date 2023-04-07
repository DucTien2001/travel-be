export interface FindAll {
  take: number;
  page: number;
  keyword?: string;
}

export interface FindOne {
  language?: string;
}

export interface Create {
  name: string;
  description: string;
  startTime: Date;
  endTime: Date;
  code: string;
  policy: string;
  hotelIds: number[];
  tourIds: number[];
  numberOfCodes: number;
}

export interface Update {
  name: string;
  description: string;
  startTime: Date;
  endTime: Date;
  code: string;
  policy: string;
  hotelIds: number[];
  tourIds: number[];
  numberOfCodes: number;
  language?: string;
}