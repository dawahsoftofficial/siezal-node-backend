import { BaseEntity } from "src/core/base/entity/entity.base";
import { IBranch } from "src/module/branch/interface/branch.interface";
import { Column, DeleteDateColumn, Entity } from "typeorm";

@Entity({ name: "branches" })
export class Branch extends BaseEntity implements IBranch {
  @Column({ name: "name", type: "varchar", length: 150 })
  name: string;

  @Column({ name: "address", type: "varchar", length: 255 })
  address: string;

  @Column({ name: "latitude", type: "double precision" })
  latitude: number;

  @Column({ name: "longitude", type: "double precision" })
  longitude: number;

  @Column({ name: "phone", type: "varchar", length: 50 })
  phone: string;

  @Column({ name: "email", type: "varchar", length: 255, nullable: true })
  email?: string | null;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive: boolean;

  @DeleteDateColumn({ name: "deleted_at", type: "timestamp", nullable: true })
  deletedAt?: Date | null;
}
