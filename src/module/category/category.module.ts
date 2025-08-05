import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryService } from './category.service';
// import { AdminCategoryController } from './controller/category-admin.controller';
import { UserCategoryController } from './controller/category-user.controller';
import { Category } from 'src/database/entities/category.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Category])],
    controllers: [UserCategoryController],
    providers: [CategoryService],
    exports: [CategoryService],
})
export class CategoryModule { }
