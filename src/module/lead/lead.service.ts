import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseSqlService } from "src/core/base/services/sql.base.service";
import { Repository } from "typeorm";

import { ELeadStatus } from "src/common/enums/lead.enum";
import { Lead } from "src/database/entities/lead.entity";
import { CreateLeadRequestDto } from "./dto/create-lead.dto";
import { ILead } from "./interface/lead.interface";

@Injectable()
export class LeadService extends BaseSqlService<Lead, ILead> {
  constructor(
    @InjectRepository(Lead)
    private readonly leadRequestRepository: Repository<Lead>
  ) {
    super(leadRequestRepository);
  }

  async createLeadRequest(data: CreateLeadRequestDto) {
    const deleteRequest = this.leadRequestRepository.create({
      status: ELeadStatus.PENDING,
      ...data,
    });

    return await this.leadRequestRepository.save(deleteRequest);
  }
}
