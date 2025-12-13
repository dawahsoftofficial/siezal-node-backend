import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { HttpModule } from "@nestjs/axios";
import { Product } from "src/database/entities/product.entity";
import { ProductService } from "./product.service";
import { AdminProductController } from "./controller/product-admin.controller";
import { ProductController } from "./controller/product.controller";
import { ProductAttributePivot } from "src/database/entities/product-attributes.entity";
import { Attribute } from "src/database/entities/attribute.entity";
import { SettingModule } from "../setting/setting.module";
import { ProductLiveSyncService } from "./product-sync.service";
import { Category } from "src/database/entities/category.entity";
import { ProductImage } from "src/database/entities/product-image.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductAttributePivot, Attribute, Category, ProductImage]),
    forwardRef(() => SettingModule),
    HttpModule,
  ],
  controllers: [ProductController, AdminProductController],
  providers: [ProductService, ProductLiveSyncService],
  exports: [ProductService],
})
export class ProductModule {}
