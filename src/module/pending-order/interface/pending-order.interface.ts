import { IEntityBase } from "src/core/base/entity/interface/entity-interface.base";
import { IUser } from "src/module/user/interface/user.interface";

export interface IPendingOrder extends IEntityBase {
  merchantOrderId: string;
  userId: number;
  user?: IUser;
  dto: any; // ideally CreateOrderDto type
  status: "PENDING" | "FAILED" | "SUCCESS";
}
