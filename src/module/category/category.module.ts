import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CategoryService } from "./category.service";
// import { AdminCategoryController } from './controller/category-admin.controller';
import { CategoryController } from "./controller/category.controller";
import { Category } from "src/database/entities/category.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule {}
