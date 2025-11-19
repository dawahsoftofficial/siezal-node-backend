import { BaseEntity } from "src/core/base/entity/entity.base";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from "typeorm";
import { PendingOrder } from "./pending-order.entity";
import {
  EPaymentSessionStatus,
  IActionLog,
  IPaymentSession,
} from "src/module/payment-session/interface/payment-session.interface";
import {
  EGatewayType,
  IOrder,
} from "src/module/order/interface/order.interface";
import { Order } from "./order.entity";
import { IPendingOrder } from "src/module/pending-order/interface/pending-order.interface";

@Entity({ name: "payment_sessions" })
export class PaymentSession extends BaseEntity implements IPaymentSession {
  @Column({ name: "pending_order_id" })
  pendingOrderId: number;

  @ManyToOne(() => PendingOrder, (po) => po.paymentSessions, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "pending_order_id" })
  pendingOrder: IPendingOrder;

  @Column({
    type: "enum",
    enum: EGatewayType,
  })
  gateway: EGatewayType; // "meezan", "easypaisa", "cod"

  @Column({ nullable: true, name: "gateway_order_id", type: "varchar" })
  gatewayOrderId?: string | null;

  @Column({
    default: EPaymentSessionStatus.PENDING,
    enum: EPaymentSessionStatus,
    type: "enum",
  })
  status: EPaymentSessionStatus;

  @Column("int")
  amount: number;

  @Column("json", { name: "action_logs", nullable: true })
  actionLogs: IActionLog[];

  @Column("json", { nullable: true, name: "raw_request" })
  rawRequest: any;

  @Column("json", { nullable: true, name: "raw_response" })
  rawResponse: any;

  @OneToOne(() => Order, (data) => data.paymentSession, {
    cascade: true,
  })
  order?: Partial<IOrder> | null;
}
