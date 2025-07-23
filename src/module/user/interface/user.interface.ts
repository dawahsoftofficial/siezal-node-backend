import { ERole } from "src/common/enums/role.enum";
import { IEntityBase } from "src/core/base/entity/interface/entity-interface.base";

export interface IUser extends IEntityBase {
      
    firstName: string;
    lastName?: string;
    email: string;
    password?: string;
    role?:ERole
    accessToken?: string; // Optional, used for JWT
    refreshToken?: string; // Optional, used for encrypted refresh token
   
  }
  