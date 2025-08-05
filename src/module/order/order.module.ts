import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/database/entities/order.entity';
import { OrderService } from './order.service';
// import { AdminOrderController } from './controller/order-admin.controller';
import { UserOrderController } from './controller/order.user.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Order])],
    controllers: [UserOrderController],
    providers: [OrderService],
    exports: [OrderService],
})
export class OrderModule { }
