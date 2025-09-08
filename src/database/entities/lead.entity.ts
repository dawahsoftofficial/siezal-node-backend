import { Column, Entity } from "typeorm";
import { BaseEntity } from "src/core/base/entity/entity.base";
import { ELeadStatus, ELeadType } from "src/common/enums/lead.enum";
import { ILead } from "../../module/lead/interface/lead.interface";

@Entity({ name: "leads" })
export class Lead extends BaseEntity implements ILead {
  @Column({ name: "first_name", type: "varchar", length: 100 })
  firstName: string;

  @Column({ name: "last_name", type: "varchar", length: 100 })
  lastName: string;

  @Column({ name: "email", type: "varchar", length: 150, nullable: true })
  email?: string | null;

  @Column({ name: "phone", type: "varchar", length: 20 })
  phone: string;

  @Column({ name: "purpose", type: "text", nullable: true })
  purpose?: string | null;

  @Column({ name: "comments", type: "text", nullable: true })
  comments?: string | null;

  @Column({
    name: "status",
    type: "enum",
    enum: ELeadStatus,
  })
  status: ELeadStatus;

  @Column({
    name: "type",
    type: "enum",
    enum: ELeadType,
  })
  type: ELeadType;
}
