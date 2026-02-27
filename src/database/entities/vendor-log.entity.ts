import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "src/core/base/entity/entity.base";
import { IVendorLog } from "src/module/vendor/interface/vendor-log.interface";
import { Vendor } from "./vendor.entity";

@Entity({ name: "vendor_logs" })
export class VendorLog extends BaseEntity implements IVendorLog {
  @Column({ name: "vendor_id", type: "int" })
  vendorId: number;

  @ManyToOne(() => Vendor, (vendor) => vendor.logs, { onDelete: "CASCADE" })
  @JoinColumn({ name: "vendor_id" })
  vendor: Vendor;

  @Column({ name: "type", type: "varchar", length: 100 })
  type: string;

  @Column({ name: "endpoint", type: "varchar", length: 255 })
  endpoint: string;

  @Column({ name: "method", type: "varchar", length: 20 })
  method: string;

  @Column({ name: "request_payload", type: "json", nullable: true })
  requestPayload?: any;

  @Column({ name: "response_payload", type: "json", nullable: true })
  responsePayload?: any;

  @Column({ name: "status_code", type: "int" })
  statusCode: number;

  @Column({ name: "success", type: "boolean", default: false })
  success: boolean;

  @Column({ name: "error_message", type: "text", nullable: true })
  errorMessage?: string | null;
}
