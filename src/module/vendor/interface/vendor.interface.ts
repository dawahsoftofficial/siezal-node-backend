export interface IVendor {
  id?: number;
  name: string;
  code: string;
  contactName?: string | null;
  contactEmail?: string | null;
  clientId?: string | null;
  clientSecretHash?: string | null;
  isActive: boolean;
  lastLoginAt?: Date | string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
