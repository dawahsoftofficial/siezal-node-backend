import { Module } from "@nestjs/common";
import { UserModule } from "../user/user.module";
import { AuthService } from "./auth.service";
import { AuthAdminController } from "./controller/auth-admin.controller";
import { AuthController } from "./controller/auth-user.controller";
import { FirebaseModule } from "src/shared/firebase/firebase.module";
import { UserSessionModule } from "../user-session/user-session.module";

@Module({
  controllers: [AuthAdminController, AuthController],
  imports: [
    UserModule,
    UserSessionModule,
    // FirebaseModule
  ],
  providers: [AuthService],
})
export class AuthModule {}
