import { IEntityBase } from "src/core/base/entity/interface/entity-interface.base";

export interface IFcmToken extends IEntityBase {
    userId: number;
    token: string;
}