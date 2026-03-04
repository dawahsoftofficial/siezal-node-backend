import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "src/core/base/entity/entity.base";
import { IVendor } from "src/module/vendor/interface/vendor.interface";
import { VendorLog } from "./vendor-log.entity";

@Entity({ name: "vendors" })
export class Vendor extends BaseEntity implements IVendor {
  @Column({ name: "name", type: "varchar", length: 150 })
  name: string;

  @Column({ name: "code", type: "varchar", length: 100, unique: true })
  code: string;

  @Column({ name: "contact_name", type: "varchar", length: 150, nullable: true })
  contactName?: string | null;

  @Column({ name: "contact_email", type: "varchar", length: 255, nullable: true })
  contactEmail?: string | null;

  @Column({ name: "client_id", type: "varchar", length: 255, unique: true, nullable: true })
  clientId?: string | null;

  @Column({ name: "client_secret_hash", type: "varchar", length: 255, nullable: true })
  clientSecretHash?: string | null;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive: boolean;

  @Column({ name: "last_login_at", type: "timestamp", nullable: true })
  lastLoginAt?: Date | null;

  @OneToMany(() => VendorLog, (log) => log.vendor)
  logs?: VendorLog[];
}
