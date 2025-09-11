import { IEntityBase } from "src/core/base/entity/interface/entity-interface.base";
import { IUser } from "src/module/user/interface/user.interface";

export interface IAddress extends IEntityBase {
  id?: number;

  shippingAddressLine1: string;
  shippingAddressLine2?: string | null;
  shippingPostalCode: string;
  shippingCity: string;
  shippingCountry: string;
  shippingState: string;

  userId: number;
  user?: IUser | null
}
