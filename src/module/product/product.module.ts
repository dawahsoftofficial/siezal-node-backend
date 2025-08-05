import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'src/database/entities/product.entity';
import { ProductService } from './product.service';
// import { AdminProductController } from './controller/product-admin.controller';
import { UserProductController } from './controller/product-user.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Product])],
    controllers: [UserProductController],
    providers: [ProductService],
    exports: [ProductService],
})
export class ProductModule { }
