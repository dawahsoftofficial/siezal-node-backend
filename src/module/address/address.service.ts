import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseSqlService } from "src/core/base/services/sql.base.service";
import { Repository } from "typeorm";

import { Address } from "src/database/entities/address.entity";
import { IAddress } from "./interface/address.interface";

@Injectable()
export class AddressService extends BaseSqlService<Address, IAddress> {
  constructor(
    @InjectRepository(Address)
    private readonly addressRequestRepository: Repository<Address>
  ) {
    super(addressRequestRepository);
  }
}
