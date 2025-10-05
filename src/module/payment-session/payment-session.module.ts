import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PaymentSession } from "../../database/entities/payment-session.entity";
import { PaymentSessionService } from "./payment-session.service";
import { PendingOrderModule } from "../pending-order/pending-order.module";
import { PaymentGatewayModule } from "src/shared/payment-gateway/payment-gateway.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentSession]),
    PendingOrderModule,
    PaymentGatewayModule,
  ],
  providers: [PaymentSessionService],
  exports: [PaymentSessionService],
})
export class PaymentSessionModule {}
