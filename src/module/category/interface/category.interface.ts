import { IEntityBase } from "src/core/base/entity/interface/entity-interface.base";

export interface ICategory extends IEntityBase {
    name: string;
    slug: string;
    parentId?: number;
}