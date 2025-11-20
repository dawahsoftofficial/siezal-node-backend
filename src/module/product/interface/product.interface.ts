import { EInventoryStatus } from "src/common/enums/inventory-status.enum";
import { EProductUnit } from "src/common/enums/product-unit.enum";
import { IEntityBase } from "src/core/base/entity/interface/entity-interface.base";
import { ICategory } from "src/module/category/interface/category.interface";

export interface IProduct extends IEntityBase {
  sku?: string;
  imported: boolean;
  title: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  price: number;
  salePrice?: number | null;
  stockQuantity: number;
  status: EInventoryStatus;
  categoryId: number;
  inventoryId: number;
  image: string;
  unit: EProductUnit;
  isGstEnabled: boolean;
  gstFee?: number | null;
  // gallery?: string[];

  category?: ICategory
}
