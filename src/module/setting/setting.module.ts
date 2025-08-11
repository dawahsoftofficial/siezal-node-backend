import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Setting } from "src/database/entities/setting.entity";
import { SettingService } from "./setting.service";
// import { AdminSettingController } from './controller/setting-admin.controller';
import { SettingController } from "./controller/setting.controller";
import { CategoryModule } from "../category/category.module";
import { ProductModule } from "../product/product.module";
@Module({
  imports: [TypeOrmModule.forFeature([Setting]), CategoryModule, ProductModule],
  controllers: [SettingController],
  providers: [SettingService],
  exports: [SettingService],
})
export class SettingModule {}
