import { Module } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";
import { AdminDashboardController } from "./controller/dashboard-admin.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Order } from "src/database/entities/order.entity";
import { OrderItem } from "src/database/entities/order-item.entity";
@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem])],
  controllers: [AdminDashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule { }
