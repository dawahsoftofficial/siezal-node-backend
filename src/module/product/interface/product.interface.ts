import { EInventoryStatus } from "src/common/enums/inventory-status.enum";
import { EProductUnit } from "src/common/enums/product-unit.enum";
import { IEntityBase } from "src/core/base/entity/interface/entity-interface.base";

export interface IProduct extends IEntityBase {
  sku?: string;
  title: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  price: number;
  salePrice?: number;
  stockQuantity: number;
  status: EInventoryStatus;
  categoryId: number;
  inventoryId: number;
  image: string;
  unit: EProductUnit;
  isGstEnabled: boolean;
  gstFee?: number | null;
  // gallery?: string[];
}
