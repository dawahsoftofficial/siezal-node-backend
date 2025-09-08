import { Module } from "@nestjs/common";
import { FcmTokenModule } from "../fcm-token/fcm-token.module";
import { NotificationAdminController } from "./controller/notification-admin.controller";
import { NotificationService } from "./notification.service";

@Module({
  controllers: [NotificationAdminController],
  imports: [FcmTokenModule],
  providers: [NotificationService],
})
export class NotificationModule {}
