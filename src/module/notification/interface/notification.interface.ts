import { IEntityBase } from "src/core/base/entity/interface/entity-interface.base";

export interface INotification extends IEntityBase {
    userIds?: number[] | null;
    title: string;
    message: string;
    read: boolean;
}