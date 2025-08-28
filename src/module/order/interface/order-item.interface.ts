import { IEntityBase } from "src/core/base/entity/interface/entity-interface.base";

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
  };
}
