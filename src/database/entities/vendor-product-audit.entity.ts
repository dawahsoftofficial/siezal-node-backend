import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "src/core/base/entity/entity.base";
import {
  IVendorProductAudit,
  VendorProductAuditAction,
} from "src/module/vendor/interface/vendor-product-audit.interface";
import { Branch } from "./branch.entity";
import { Product } from "./product.entity";
import { Vendor } from "./vendor.entity";
import { VendorLog } from "./vendor-log.entity";

@Entity({ name: "vendor_product_audits" })
@Index("IDX_vendor_product_audits_product_created", [
  "productReferenceId",
  "createdAt",
])
@Index("IDX_vendor_product_audits_vendor_created", ["vendorId", "createdAt"])
@Index("IDX_vendor_product_audits_branch_sku", ["branchReferenceId", "sku"])
export class VendorProductAudit
  extends BaseEntity
  implements IVendorProductAudit
{
  @Column({ name: "product_id", type: "int", nullable: true })
  productId?: number | null;

  @Column({ name: "product_reference_id", type: "int" })
  productReferenceId: number;

  @ManyToOne(() => Product, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "product_id" })
  product?: Product | null;

  @Column({ name: "vendor_id", type: "int", nullable: true })
  vendorId?: number | null;

  @ManyToOne(() => Vendor, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "vendor_id" })
  vendor?: Vendor | null;

  @Column({ name: "vendor_log_id", type: "int", nullable: true })
  vendorLogId?: number | null;

  @ManyToOne(() => VendorLog, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "vendor_log_id" })
  vendorLog?: VendorLog | null;

  @Column({ name: "branch_id", type: "int", nullable: true })
  branchId?: number | null;

  @Column({ name: "branch_reference_id", type: "int" })
  branchReferenceId: number;

  @ManyToOne(() => Branch, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "branch_id" })
  branch?: Branch | null;

  @Column({ name: "vendor_code", type: "varchar", length: 100 })
  vendorCode: string;

  @Column({ name: "sku", type: "varchar", length: 255 })
  sku: string;

  @Column({ name: "action", type: "varchar", length: 20 })
  action: VendorProductAuditAction;

  @Column({ name: "changed_fields", type: "json" })
  changedFields: Record<string, { before: unknown; after: unknown }>;

  @Column({ name: "before_snapshot", type: "json", nullable: true })
  beforeSnapshot?: Record<string, unknown> | null;

  @Column({ name: "after_snapshot", type: "json" })
  afterSnapshot: Record<string, unknown>;

  @Column({ name: "request_payload", type: "json" })
  requestPayload: Record<string, unknown>;
}
