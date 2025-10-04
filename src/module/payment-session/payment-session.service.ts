import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseSqlService } from "src/core/base/services/sql.base.service";
import { Repository } from "typeorm";

import { PaymentSession } from "../../database/entities/payment-session.entity";
import { IPaymentSession } from "./interface/payment-session.interface";

@Injectable()
export class PaymentSessionService extends BaseSqlService<
  PaymentSession,
  IPaymentSession
> {
  constructor(
    @InjectRepository(PaymentSession)
    private readonly paymentSessionRequestRepository: Repository<PaymentSession>
  ) {
    super(paymentSessionRequestRepository);
  }
}
