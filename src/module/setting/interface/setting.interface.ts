import { ESettingType } from "src/common/enums/setting-type.enum";
import { IEntityBase } from "src/core/base/entity/interface/entity-interface.base";

export interface ISetting extends IEntityBase {
    title?: string;
    key: string;
    value: string;
    type: ESettingType;
}