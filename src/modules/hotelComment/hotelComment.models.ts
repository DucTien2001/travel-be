export interface ICreateHotelComment {
  comment: string;
  rate: number;
  hotelId: number;
  billId: number;
  userId: number;
}

export interface IUpdateHotelComment {
  comment: string;
  rate: number;
}

export interface IReplyHotelComment {
  replyComment: string;
}