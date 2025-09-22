import { IEntityBase } from "src/core/base/entity/interface/entity-interface.base";
import { IProduct } from "src/module/product/interface/product.interface";

export interface ICategory extends IEntityBase {
  name: string;
  slug: string;
  icon: string;
  parentId?: number | null;
  parentCategory?: ICategory;
  subCategories?: ICategory[];
  products?: IProduct[];
  slideShow: boolean;
  isFeatured: boolean;
  position: number;
  images: string[];
}
