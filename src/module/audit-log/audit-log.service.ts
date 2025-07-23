import { Injectable, LoggerService } from '@nestjs/common';


import pino from 'pino';
import { ELogLevel, ELogType } from 'src/common/enums/app.enum';
import { BaseSqlService } from 'src/core/base/services/sql.base.service';
import { AuditLog } from 'src/database/entities/audit-log.entity';
import { IAuditLog } from './interface/audit-log.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AuditLogService
  extends BaseSqlService<AuditLog, IAuditLog>
  implements LoggerService
{
  private readonly logger;
  constructor( @InjectRepository(AuditLog) private logModel: Repository<AuditLog>) {
    super(logModel);
    this.logger = pino({
      level: ELogLevel.INFO,
      hooks: {
        logMethod: async (inputArgs, method, level) => {
          const [message, meta] = inputArgs;
          const { type, ElogLevel, exception } = meta;
          this.create({
            message,
            level: ElogLevel,
            type: type,
            stacktrace: exception,
          });
        },
      },
    });
  }

  log(message: string, exception?: any, type?: ELogType) {
    this.logger.info(message, { exception, ElogLevel: ELogLevel.INFO, type });
  }

  warn(message: string, exception?: any, type?: ELogType) {
    this.logger.warn(message, { exception, ElogLevel: ELogLevel.WARN, type });
  }

  error(message: string, exception?: any, type?: ELogType) {
    this.logger.error(message, { exception, ElogLevel: ELogLevel.ERROR, type });
  }

  debug(message: string, exception?: any, type?: ELogType) {
    this.logger.debug(message, { exception, ElogLevel: ELogLevel.DEBUG, type });
  }
}
