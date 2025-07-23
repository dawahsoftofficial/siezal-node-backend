import {
  Entity,
  Column,
} from 'typeorm';
import { ELogLevel, ELogType } from 'src/common/enums/app.enum';
import { BaseEntity } from 'src/core/base/entity/entity.base';
import { IAuditLog } from 'src/module/audit-log/interface/audit-log.interface';

@Entity({ name: 'audit_logs' }) // Snake case is standard in SQL
export class AuditLog  extends BaseEntity implements IAuditLog {

  @Column({
    type: 'enum',
    enum: ELogLevel,
    default: ELogLevel.ERROR,
  })
  level: ELogLevel;

  @Column({
    type: 'enum',
    enum: ELogType,
    default: ELogType.GENERAL,
  })
  type: ELogType;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'json', nullable: true })
  stacktrace?: any;

}
