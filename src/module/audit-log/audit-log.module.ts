// sns.module.ts
import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';


import { AuditLogService } from './audit-log.service';
import { AuditLog } from 'src/database/entities/audit-log.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  providers: [AuditLogService],
  exports: [AuditLogService],
})
export class AuditLogModule {}
