import { Module } from "@nestjs/common";
import { PaymentCallbackService } from "./payment-callback.service";
import { OrderModule } from "../order/order.module";
import { PaymentCallbackController } from "./payment-callback.controller";

@Module({
  imports: [OrderModule],
  controllers: [PaymentCallbackController],
  providers: [PaymentCallbackService],
  exports: [PaymentCallbackService],
})
export class PaymentCallbackModule {}
