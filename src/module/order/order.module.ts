import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/database/entities/order.entity';
import { OrderService } from './order.service';
import { AdminOrderController } from './controller/order-admin.controller';
import { UserOrderController } from './controller/order-user.controller';
import { OrderItem } from 'src/database/entities/order-item.entity';
import { ProductModule } from '../product/product.module';
import { AddressModule } from '../address/address.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
    imports: [TypeOrmModule.forFeature([Order, OrderItem]), AddressModule, ProductModule, NotificationModule],
    controllers: [UserOrderController, AdminOrderController],
    providers: [OrderService],
    exports: [OrderService],
})
export class OrderModule { }
