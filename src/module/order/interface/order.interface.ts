import { EOrderStatus } from "src/common/enums/order-status.enum";
import { IEntityBase } from "src/core/base/entity/interface/entity-interface.base";
import { IOrderItem } from "./order-item.interface";

export interface IOrder extends IEntityBase {
  orderUID: string;

  userId: number;
  userFullName: string;
  userPhone: string;
  userEmail?: string;

  shippingAddressLine1: string;
  shippingAddressLine2: string;
  shippingCity: string;
  shippingState?: string;
  shippingCountry: string;
  shippingPostalCode: string;
  longLat?: string;

  gstAmount: number;
  shippingAmount: number;
  totalAmount: number;
  totalDiscountAmount?: number;

  status: EOrderStatus;
  items?: IOrderItem[];
}
