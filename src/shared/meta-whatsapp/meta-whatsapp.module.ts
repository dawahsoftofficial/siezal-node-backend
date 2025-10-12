import { Module, Global } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MetaWhatsappService } from "./meta-whatsapp.service";
import { HttpModule } from "@nestjs/axios";

@Global()
@Module({
  imports: [ConfigModule, HttpModule],
  providers: [MetaWhatsappService],
  exports: [MetaWhatsappService],
})
export class MetaWhatsappModule {}
