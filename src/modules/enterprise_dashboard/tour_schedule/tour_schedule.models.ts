export interface ISchedule {
  id: number;
  tourId: number;
  day: number;
  startTime: number;
  endTime: number;
  description: string;
  language: string;
}

export interface CreateOne {
  tourId: number;
  day: number;
  startTime: number;
  endTime: number;
  description: string;
}

interface scheduleItem {
  id: number;
  startTime: number;
  endTime: number;
  description: string;
  language: string;
}

export interface CreateMultiple {
  tourId: number;
  day: number;
  schedule: scheduleItem[];
}

export interface CreateOrUpdate {
  tourId: number;
  day: number;
  schedule: scheduleItem[];
}

export interface Update {
  startTime: number;
  endTime: number;
  description: string;
}
