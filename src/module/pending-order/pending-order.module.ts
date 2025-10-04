import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PendingOrder } from "src/database/entities/pending-order.entity";

@Module({
  imports: [TypeOrmModule.forFeature([PendingOrder])],
})
export class PendingOrderModule {}
