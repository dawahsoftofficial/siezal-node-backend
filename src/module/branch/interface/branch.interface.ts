export interface IBranch {
  id?: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  email?: string | null;
  isActive: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  deletedAt?: Date | string | null;
}
