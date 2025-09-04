import { Module } from "@nestjs/common";
import { UserModule } from "../user/user.module";
import { AuthService } from "./auth.service";
import { AuthAdminController } from "./controller/auth-admin.controller";
import { AuthController } from "./controller/auth-user.controller";
import { UserSessionModule } from "../user-session/user-session.module";
import { FcmTokenModule } from "../fcm-token/fcm-token.module";

@Module({
  controllers: [AuthAdminController, AuthController],
  imports: [UserModule, UserSessionModule, FcmTokenModule],
  providers: [AuthService],
})
export class AuthModule {}
