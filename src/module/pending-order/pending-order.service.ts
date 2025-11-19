import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseSqlService } from "src/core/base/services/sql.base.service";
import { Repository } from "typeorm";

import { PendingOrder } from "src/database/entities/pending-order.entity";
import { IPendingOrder } from "./interface/pending-order.interface";

@Injectable()
export class PendingOrderService extends BaseSqlService<
  PendingOrder,
  IPendingOrder
> {
  constructor(
    @InjectRepository(PendingOrder)
    private readonly pendingOrderRequestRepository: Repository<PendingOrder>
  ) {
    super(pendingOrderRequestRepository);
  }
}
