import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Product } from "src/database/entities/product.entity";
import { ProductService } from "./product.service";
import { AdminProductController } from './controller/product-admin.controller';
import { ProductController } from "./controller/product.controller";
import { ProductAttributePivot } from "src/database/entities/product-attributes.entity";
import { Attribute } from "src/database/entities/attribute.entity";
import { SettingModule } from "../setting/setting.module";

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductAttributePivot, Attribute]), forwardRef(() => SettingModule)],
  controllers: [ProductController, AdminProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule { }
