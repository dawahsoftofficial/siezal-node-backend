import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { HttpModule } from "@nestjs/axios";
import { CategoryService } from "./category.service";
import { AdminCategoryController } from "./controller/category-admin.controller";
import { CategoryController } from "./controller/category.controller";
import { Category } from "src/database/entities/category.entity";
import { CategoryLiveSyncService } from "./category-sync.service";

@Module({
  imports: [TypeOrmModule.forFeature([Category]), HttpModule],
  controllers: [CategoryController, AdminCategoryController],
  providers: [CategoryService, CategoryLiveSyncService],
  exports: [CategoryService],
})
export class CategoryModule {}
