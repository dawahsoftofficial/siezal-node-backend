import { IUser } from "src/module/user/interface/user.interface";
import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { User } from "./user.entity";
import { BaseEntity } from "src/core/base/entity/entity.base";
import { IPendingOrder } from "src/module/pending-order/interface/pending-order.interface";
import { PaymentSession } from "./payment-session.entity";
import { IPaymentSession } from "src/module/payment-session/interface/payment-session.interface";

@Entity({ name: "pending_orders" })
export class PendingOrder extends BaseEntity implements IPendingOrder {
  @Column({ nullable: false, unique: true, name: "merchant_order_id" })
  merchantOrderId: string;

  @Column({ name: "user_id", type: "int" })
  userId: number;

  @ManyToOne(() => User, (user) => user.pendingOrders, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: IUser;

  @Column("json")
  dto: any; // full order payload

  @Column({ default: "PENDING" })
  status: "PENDING" | "FAILED" | "SUCCESS";

  @OneToMany(() => PaymentSession, (data) => data.pendingOrder, {
    cascade: true,
  })
  paymentSessions?: Partial<IPaymentSession[]> | null;
}
