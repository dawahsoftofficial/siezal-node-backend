import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Setting } from "src/database/entities/setting.entity";
import { SettingService } from "./setting.service";
import { AdminSettingController } from "./controller/setting-admin.controller";
import { SettingController } from "./controller/setting.controller";
import { CategoryModule } from "../category/category.module";
import { ProductModule } from "../product/product.module";
import { DeleteAccountRequest } from "src/database/entities/deletion-requests.entity";
@Module({
  imports: [TypeOrmModule.forFeature([Setting, DeleteAccountRequest]), CategoryModule, ProductModule],
  controllers: [SettingController, AdminSettingController],
  providers: [SettingService],
  exports: [SettingService],
})
export class SettingModule {}
