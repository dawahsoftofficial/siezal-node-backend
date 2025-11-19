import { Injectable, Logger } from "@nestjs/common";
import { OrderService } from "../order/order.service";
import { verifySignature } from "src/common/utils/hmac.util";
@Injectable()
export class PaymentCallbackService {
  private readonly logger = new Logger(PaymentCallbackService.name);

  constructor(private readonly orderService: OrderService) {}

  bankCallBackHandler(merchantOrderId: string, sig: string) {
    this.logger.log("Received Meezan payment callback", merchantOrderId);
    if (
      !verifySignature(
        {
          orderNumber: merchantOrderId,
        },
        sig
      )
    ) {
      this.logger.warn(
        "Invalid signature for Meezan payment callback",
        merchantOrderId
      );
      return { success: false, message: "Invalid signature" };
    }
    return this.orderService.orderCallback(merchantOrderId);
    // Process the callback payload and update order status accordingly
  }
}
