export type BranchWeekDay =
  | "sun"
  | "mon"
  | "tue"
  | "wed"
  | "thu"
  | "fri"
  | "sat";

export interface IBranchDaySchedule {
  isOpen: boolean;
  startTime: string | null;
  endTime: string | null;
}

export type IBranchWeeklySchedule = Record<BranchWeekDay, IBranchDaySchedule>;

export interface IBranch {
  id?: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  email?: string | null;
  isActive: boolean;
  weeklySchedule?: IBranchWeeklySchedule | null;
  deliveryAreas?: string[] | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  deletedAt?: Date | string | null;
}
