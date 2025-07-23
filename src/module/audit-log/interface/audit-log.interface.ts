import { ELogLevel, ELogType } from "src/common/enums/app.enum";
import { IEntityBase } from "src/core/base/entity/interface/entity-interface.base";

export interface IAuditLog extends IEntityBase {
  level: ELogLevel;
  type: ELogType;
  message: string;
  stacktrace?: any;
}
