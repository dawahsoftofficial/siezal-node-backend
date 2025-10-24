import { Global, Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { ConfigModule } from "@nestjs/config";
import { MessagingService } from "./messaging.service";
import { TwilioProvider } from "./provider/twilio.provider";
import { MetaWhatsappProvider } from "./provider/meta-whatsapp.provider";
import { SettingModule } from "src/module/setting/setting.module";

@Global()
@Module({
  imports: [HttpModule, ConfigModule, SettingModule],
  providers: [MessagingService, TwilioProvider, MetaWhatsappProvider],
  exports: [MessagingService],
})
export class MessagingModule {}
