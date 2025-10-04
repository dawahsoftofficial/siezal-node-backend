import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PaymentSession } from "../../database/entities/payment-session.entity";

@Module({
  imports: [TypeOrmModule.forFeature([PaymentSession])],
})
export class PaymentSessionModule {}
