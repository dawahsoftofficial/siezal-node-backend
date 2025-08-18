import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CategoryService } from "./category.service";

import { CategoryController } from "./controller/category.controller";
import { Category } from "src/database/entities/category.entity";
import { AdminCategoryController } from "./controller/Category-admin.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  controllers: [CategoryController, AdminCategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule {}
