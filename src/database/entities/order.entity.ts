import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/core/base/entity/entity.base';
import { IOrder } from 'src/module/order/interface/order.interface';
import { EOrderStatus } from 'src/common/enums/order-status.enum';
import { OrderItem } from './order-item.entity';
import { IOrderItem } from 'src/module/order/interface/order-item.interface';

@Entity({ name: 'orders' })
export class Order extends BaseEntity implements IOrder {
  @Column({ name: 'order_uid', type: 'varchar', length: 100, unique: true })
  orderUID: string;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ name: 'user_full_name', type: 'varchar', length: 255 })
  userFullName: string;

  @Column({ name: 'user_phone', type: 'varchar', length: 20 })
  userPhone: string;

  @Column({ name: 'user_email', type: 'varchar', length: 255, nullable: true })
  userEmail?: string;

  @Column({ name: 'shipping_address_line1', type: 'varchar', length: 255 })
  shippingAddressLine1: string;

  @Column({ name: 'shipping_address_line2', type: 'varchar', length: 255, nullable: true })
  shippingAddressLine2: string;

  @Column({ name: 'shipping_city', type: 'varchar', length: 100 })
  shippingCity: string;

  @Column({ name: 'shipping_state', type: 'varchar', length: 100, nullable: true })
  shippingState?: string;

  @Column({ name: 'shipping_country', type: 'varchar', length: 100 })
  shippingCountry: string;

  @Column({ name: 'shipping_postal_code', type: 'varchar', length: 20 })
  shippingPostalCode: string;

  @Column({ name: 'long_lat', type: 'varchar', length: 100, nullable: true })
  longLat?: string;

  @Column({ name: 'gst_amount', type: 'decimal', precision: 10, scale: 2 })
  gstAmount: number;

  @Column({ name: 'shipping_amount', type: 'decimal', precision: 10, scale: 2 })
  shippingAmount: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({
    name: "total_discount_amount",
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: true,
    comment: "Total discount if discount enable from setting",
  })
  totalDiscountAmount?: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: EOrderStatus,
  })
  status: EOrderStatus;

  @OneToMany(() => OrderItem, item => item.order, { cascade: true })
  items?: IOrderItem[];
}
