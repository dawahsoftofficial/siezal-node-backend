import { Module } from "@nestjs/common";
import { UserModule } from "../user/user.module";
import { AuthService } from "./auth.service";
import { AuthAdminController } from "./controller/auth-admin.controller";

@Module({
  controllers: [AuthAdminController],
  imports: [
    UserModule,
  ],
  providers: [AuthService],
})
export class AuthModule {}
