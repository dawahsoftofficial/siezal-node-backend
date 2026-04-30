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

export interface IBranchServiceAreaPoint {
  lat: number;
  lng: number;
}

export type IBranchWeeklySchedule = Record<BranchWeekDay, IBranchDaySchedule>;

export interface IBranch {
  id?: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string | null;
  email?: string | null;
  isActive: boolean;
  isEcommerceEnabled: boolean;
  weeklySchedule?: IBranchWeeklySchedule | null;
  serviceArea?: IBranchServiceAreaPoint[] | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  deletedAt?: Date | string | null;
}
