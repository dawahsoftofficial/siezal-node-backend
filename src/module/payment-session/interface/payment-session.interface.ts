import { IPendingOrder } from "src/module/pending-order/interface/pending-order.interface";
import { IEntityBase } from "src/core/base/entity/interface/entity-interface.base";
import { EGatewayType } from "src/module/order/interface/order.interface";

export enum EPaymentSessionStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

export interface IActionLog {
  timestamp: string; // ISO timestamp
  action: string; // e.g., REGISTERED, CALLBACK_RECEIVED, REFUND_ISSUED
  message: string; // descriptive message
  details?: Record<string, any>;
}

export interface IPaymentSession extends IEntityBase {
  pendingOrderId: number;
  pendingOrder?: IPendingOrder; // optional relation
  gateway: EGatewayType;
  gatewayOrderId?: string | null;
  status: EPaymentSessionStatus;
  amount: number;
  actionLogs: IActionLog[];
  rawRequest?: any;
  rawResponse?: any;
  createdAt?: Date;
  updatedAt?: Date;
}
