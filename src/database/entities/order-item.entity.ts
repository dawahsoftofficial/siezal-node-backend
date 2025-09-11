import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "src/core/base/entity/entity.base";
import { IOrderItem } from "src/module/order/interface/order-item.interface";
import { Order } from "./order.entity";
import { IProduct } from "src/module/product/interface/product.interface";
import { EOrderReplacementStatus } from "src/common/enums/replacement-status.enum";

@Entity({ name: "order_items" })
export class OrderItem extends BaseEntity implements IOrderItem {
  @Column({ name: "order_id" })
  orderId: number;

  @ManyToOne(() => Order, { onDelete: "CASCADE" })
  @JoinColumn({ name: "order_id" })
  order: Order;

  @Column({ name: "product_id" })
  productId: number;

  @Column({ name: "quantity", type: "int" })
  quantity: number;

  @Column({ name: "total_price", type: "decimal", precision: 10, scale: 2 })
  totalPrice: number;

  @Column({
    name: "total_gst_amount",
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: true,
  })
  totalGstAmount?: number;

  @Column({ name: "product_data", type: "json" })
  productData: {
    name: string;
    sku: string;
    price: number;
    discountedPrice?: number;
    gstFee?: number;
    category: string;
    image?: string;
  };

  @Column({ name: "replacement_status", type: "enum", enum: EOrderReplacementStatus, default: null, nullable: true })
  replacementStatus: EOrderReplacementStatus | null;

  @Column({ name: "suggested_products", type: "json", default: null, nullable: true })
  suggestedProducts: IProduct[] | null;
}
