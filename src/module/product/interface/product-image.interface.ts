import { IEntityBase } from "src/core/base/entity/interface/entity-interface.base";

export interface IProductImage extends IEntityBase {
  title: string;
  url: string;
  linked: boolean;
}
