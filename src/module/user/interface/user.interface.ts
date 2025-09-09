import { ERole } from "src/common/enums/role.enum";
import { IEntityBase } from "src/core/base/entity/interface/entity-interface.base";
import { IFcmToken } from "src/module/fcm-token/interface/fcm-token.interface";
import { IUserSession } from "src/module/user-session/interface/user-session.interface";

export interface IUser extends IEntityBase {
  firstName: string;
  lastName?: string;

  phone: string;
  email?: string | null;

  password?: string;
  role?: ERole;

  verifiedAt?: Date;

  googleId?: string;

  otp?: string | null;
  otpExpiresAt?: Date | null;

  isBanned: boolean;
  sessions?: Partial<IUserSession[]> | null;
  fcmTokens?: Partial<IFcmToken[]> | null;

  shippingAddressLine1?: string | null,
  shippingAddressLine2?: string | null,
  shippingPostalCode?: string | null,
  shippingCity?: string | null,
  shippingCountry?: string | null,
  shippingState?: string | null
}
