import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseSqlService } from "src/core/base/services/sql.base.service";
import { Not, Repository } from "typeorm";

import { PaymentSession } from "../../database/entities/payment-session.entity";
import {
  EPaymentSessionStatus,
  IPaymentSession,
} from "./interface/payment-session.interface";
import { CreateOrderDto } from "../order/dto/create-order.dto";
import { generateOrderUID } from "src/common/utils/app.util";
import { MeezanPaymentGateway } from "src/shared/payment-gateway/meezan.service";
import { PendingOrderService } from "../pending-order/pending-order.service";

@Injectable()
export class PaymentSessionService extends BaseSqlService<
  PaymentSession,
  IPaymentSession
> {
  private readonly logger = new Logger(PaymentSessionService.name);

  constructor(
    private readonly pendingOrderService: PendingOrderService,
    @InjectRepository(PaymentSession)
    private readonly paymentSessionRequestRepository: Repository<PaymentSession>,
    private readonly meezanGateway: MeezanPaymentGateway
  ) {
    super(paymentSessionRequestRepository);
  }

  async initiatePayment(userId: number, dto: CreateOrderDto) {
    const merchantOrderId = generateOrderUID();
    const pendingOrder = await this.pendingOrderService.create({
      userId,
      merchantOrderId,
      dto,
      status: "PENDING",
    });

    const response = await this.meezanGateway.registerOrder({
      merchantOrderId: pendingOrder.merchantOrderId,
      amount: Number(Math.round(dto.totalAmount)),
    });

    if (response.success) {
      await this.paymentSessionRequestRepository.save({
        pendingOrderId: pendingOrder.id,
        gateway: this.meezanGateway.name,
        gatewayOrderId: response.gatewayOrderId,
        amount: dto.totalAmount,
        status: EPaymentSessionStatus.PENDING,
        actionLogs: [
          {
            timestamp: new Date().toISOString(),
            action: "REGISTERED",
            details: {},
          },
        ],
        rawResponse: response.rawResponse,
      });
      this.logger.log("Payment initiation done", JSON.stringify(response));
      return {
        success: true,
        message: "Please proceed to payment",
        data: { ...response },
      };
    }
    this.logger.error(
      `Payment initiation failed for user ${userId}, order ${pendingOrder.id}`,
      JSON.stringify(response)
    );
    await this.pendingOrderService.updateById(pendingOrder.id!, {
      status: "FAILED",
    });

    throw new InternalServerErrorException("Unable to initiate payment", {
      cause: new Error("Payment gateway error"),
      description: JSON.stringify(response),
    });
  }

  async paymentCallback(merchantOrderId: string) {
    const pendingOrder = await this.pendingOrderService.findOne({
      where: { merchantOrderId },
    });
    if (!pendingOrder) {
      this.logger.error(
        `Payment callback received for unknown order: ${merchantOrderId}`
      );
      throw new InternalServerErrorException("Unknown pending order");
    }
    const paymentSession = await this.findOne({
      where: {
        pendingOrderId: pendingOrder.id!,
      },
      relations: ["pendingOrder"],
    });
    if (!paymentSession) {
      this.logger.error(
        `Payment callback received for unknown session: ${pendingOrder.id}`
      );
      throw new InternalServerErrorException("Unknown payment session");
    }
    if (paymentSession.status === EPaymentSessionStatus.SUCCESS) {
      this.logger.warn(
        `⚠️ Payment session ${paymentSession.id} already marked as SUCCESS — skipping callback.`
      );
      return { success: false, message: "Payment already processed" };
    }
    const gatewayOrderId = paymentSession.gatewayOrderId!;

    // Handle payment confirmation logic here
    const statusResponse =
      await this.meezanGateway.getOrderStatus(gatewayOrderId);

    if (statusResponse.success) {
      this.logger.log(`Payment confirmed for session: ${gatewayOrderId}`);
      await this.updateById(paymentSession.id!, {
        status: EPaymentSessionStatus.SUCCESS,
        actionLogs: [
          ...paymentSession.actionLogs,
          {
            timestamp: new Date().toISOString(),
            action: "CONFIRMED",
            message: statusResponse.status,
            details: statusResponse.rawResponse,
          },
        ],
      });
      return {
        success: true,
        paymentSession: paymentSession,
        pendingOrder: pendingOrder,
      };
    } else {
      this.logger.error(
        `Payment confirmation failed for session: ${gatewayOrderId}`,
        JSON.stringify(statusResponse)
      );
      const paymentSessionData = await this.updateById(paymentSession.id!, {
        status: EPaymentSessionStatus.FAILED,
        actionLogs: [
          ...paymentSession.actionLogs,
          {
            timestamp: new Date().toISOString(),
            action: "FAILED",
            message: "Failed to confirm payment",
            details: statusResponse.rawResponse,
          },
        ],
      });
      this.logger.log(
        `Updated payment session status to FAILED for session: ${JSON.stringify(pendingOrder)}`
      );
      return {
        success: false,
        paymentSession: paymentSessionData,
        detail: statusResponse.rawResponse,
      };
    }
  }
}
