import { TimezoneTransformer } from "src/common/transformers/timezone.transformer";
import {
  BaseEntity as defaultBaseEntity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

export abstract class BaseEntity extends defaultBaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  // Timestamps
  @CreateDateColumn({
    name: "created_at",
    type: "datetime",
    transformer: new TimezoneTransformer(),
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: "updated_at",
    type: "datetime",
    transformer: new TimezoneTransformer(),
  })
  updatedAt: Date;
}
