import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'src/database/entities/product.entity';
import { ProductService } from './product.service';
// import { AdminProductController } from './controller/product-admin.controller';
import { UserProductController } from './controller/product-user.controller';
import { ProductAttributePivot } from 'src/database/entities/product-attributes.entity';
import { Attribute } from 'src/database/entities/attribute.entity';

@Module({
    imports: [TypeOrmModule.forFeature([
        Product,
        ProductAttributePivot,
        Attribute
    ])],
    controllers: [UserProductController],
    providers: [ProductService],
    exports: [ProductService],
})
export class ProductModule { }
