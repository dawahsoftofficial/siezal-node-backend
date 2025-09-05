import { Module } from "@nestjs/common";
import { FcmTokenUserController } from "./controller/fcm-token-user.controller";
import { FcmTokenService } from "./fcm-token.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FcmToken } from "src/database/entities/fcm-token.entity";

@Module({
  imports: [TypeOrmModule.forFeature([FcmToken])],
  controllers: [FcmTokenUserController],
  providers: [FcmTokenService],
  exports: [FcmTokenService],
})
export class FcmTokenModule {}
