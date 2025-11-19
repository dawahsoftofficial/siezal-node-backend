import { Global, Module } from "@nestjs/common";
import { MeezanPaymentGateway } from "./meezan.service";
import { HttpModule } from "@nestjs/axios";
import { ConfigModule } from "@nestjs/config";

@Global()
@Module({
  imports: [HttpModule, ConfigModule],
  providers: [MeezanPaymentGateway],
  exports: [MeezanPaymentGateway],
})
export class PaymentGatewayModule {}
