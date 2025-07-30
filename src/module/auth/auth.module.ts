import { Module } from "@nestjs/common";
import { UserModule } from "../user/user.module";
import { AuthService } from "./auth.service";
import { AuthAdminController } from "./controller/auth-admin.controller";
import { AuthController } from "./controller/auth-user.controller";

@Module({
  controllers: [AuthAdminController,AuthController],
  imports: [
    UserModule,
  ],
  providers: [AuthService],
})
export class AuthModule {}
