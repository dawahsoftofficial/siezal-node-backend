import { ERole } from "src/common/enums/role.enum";
import { IEntityBase } from "src/core/base/entity/interface/entity-interface.base";

export interface IUser extends IEntityBase {
  firstName: string;
  lastName?: string;

  phone: string;
  email?: string;

  password?: string;
  role?: ERole;

  verifiedAt?: Date;
  
  refreshToken?: string | null;
  accessToken?: string;

  googleId?: string;

  otp?: string | null;
  otpExpiresAt?: Date | null;

  isBanned: boolean
}
