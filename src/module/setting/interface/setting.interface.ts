import { ESettingType } from "src/common/enums/setting-type.enum";
import { IEntityBase } from "src/core/base/entity/interface/entity-interface.base";
import { EProviderType } from "src/shared/messaging/interface/message-provider.enum";

export interface ISetting extends IEntityBase {
  title?: string;
  key: string;
  value: string;
  type: ESettingType;
}

export type ISmsServiceSetting = {
  [key in EProviderType]: {
    active: boolean;
    primary: boolean;
    businessNumber?: string;
  };
};

export const defaultSmsConfig: ISmsServiceSetting = {
  [EProviderType.TWILIO]: {
    active: true,
    primary: true,
    businessNumber: "+12512903230",
  },
  [EProviderType.META]: {
    active: false,
    primary: false,
    businessNumber: "+92123123132",
  },
};
