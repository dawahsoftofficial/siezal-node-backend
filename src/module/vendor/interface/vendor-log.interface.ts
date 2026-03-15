export interface IVendorLog {
  id?: number;
  vendorId: number;
  type: string;
  endpoint: string;
  method: string;
  requestPayload?: any;
  responsePayload?: any;
  statusCode: number;
  success: boolean;
  errorMessage?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
