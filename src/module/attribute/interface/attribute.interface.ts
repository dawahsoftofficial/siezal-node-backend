import { IEntityBase } from "src/core/base/entity/interface/entity-interface.base";

export interface IAttribute extends IEntityBase {
    name: string;
    slug: string;
    parentId?: number;
}