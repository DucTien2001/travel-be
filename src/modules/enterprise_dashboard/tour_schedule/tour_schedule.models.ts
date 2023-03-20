export interface CreateOne {
  tourId: number;
  day: number;
  startTime: Date;
  endTime: Date;
  description: string;
}

interface scheduleItem {
  startTime: Date;
  endTime: Date;
  description: string;
}

export interface CreateMultiple {
  tourId: number;
  day: number;
  schedule: scheduleItem[];
}

export interface Update {
  startTime: Date;
  endTime: Date;
  description: string;
}