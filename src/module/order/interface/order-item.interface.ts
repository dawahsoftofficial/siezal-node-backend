import { EOrderReplacementStatus } from "src/common/enums/replacement-status.enum";
import { IEntityBase } from "src/core/base/entity/interface/entity-interface.base";
import { IProduct } from "src/module/product/interface/product.interface";

export interface IOrderItem extends IEntityBase {
  orderId: number;
  quantity: number;
  totalPrice: number;
  productId: number;
  totalGstAmount?: number;
  productData: {
    name: string;
    sku: string;
    price: number;
    discountedPrice?: number;
    gstFee?: number;
    category: string;
    image?: string; 
  };
  replacementStatus: EOrderReplacementStatus | null;
  suggestedProducts: IProduct[] | null;
}
