export interface ICreateTourComment {
  comment: string;
  rate: number;
  tourId: number;
  userId: number;
}

export interface IUpdateTourComment {
  comment: string;
  rate: number;
}

export interface IReplyTourComment {
  replyComment: string;
}
