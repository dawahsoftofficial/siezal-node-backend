import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PendingOrder } from "src/database/entities/pending-order.entity";
import { PendingOrderService } from "./pending-order.service";

@Module({
  imports: [TypeOrmModule.forFeature([PendingOrder])],
  providers: [PendingOrderService],
  exports: [PendingOrderService],
})
export class PendingOrderModule {}
