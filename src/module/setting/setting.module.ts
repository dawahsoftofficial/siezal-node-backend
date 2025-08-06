import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Setting } from 'src/database/entities/setting.entity';
import { SettingService } from './setting.service';
// import { AdminSettingController } from './controller/setting-admin.controller';
import { UserSettingController } from './controller/setting-user.controller';
import { CategoryService } from '../category/category.service';
import { ProductService } from '../product/product.service';

@Module({
    imports: [TypeOrmModule.forFeature([Setting]), CategoryService, ProductService],
    controllers: [UserSettingController],
    providers: [SettingService],
    exports: [SettingService],
})
export class SettingModule { }
