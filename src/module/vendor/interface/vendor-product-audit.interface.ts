export type VendorProductAuditAction = "created" | "updated";

export interface IVendorProductAudit {
  id?: number;
  productId?: number | null;
  productReferenceId: number;
  vendorId?: number | null;
  vendorLogId?: number | null;
  branchId?: number | null;
  branchReferenceId: number;
  vendorCode: string;
  sku: string;
  action: VendorProductAuditAction;
  changedFields: Record<string, { before: unknown; after: unknown }>;
  beforeSnapshot?: Record<string, unknown> | null;
  afterSnapshot: Record<string, unknown>;
  requestPayload: Record<string, unknown>;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
