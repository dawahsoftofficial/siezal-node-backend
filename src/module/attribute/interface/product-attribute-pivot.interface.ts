import { IEntityBase } from "src/core/base/entity/interface/entity-interface.base";

export interface IProductAttributePivot extends IEntityBase {
    productId: number;
    attributeId: number;
}