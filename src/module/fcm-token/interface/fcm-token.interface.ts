import { EDeviceType } from "src/common/enums/device-type.enum";
import { IEntityBase } from "src/core/base/entity/interface/entity-interface.base";

export interface IFcmToken extends IEntityBase {
  userId: number;
  token: string;
  userSessionId: string;
  deviceType: EDeviceType;
}
