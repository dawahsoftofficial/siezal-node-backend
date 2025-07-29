import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseSqlService } from 'src/core/base/services/sql.base.service';
import { Repository } from 'typeorm';
import { IInventory } from './interface/inventory.interface';
import { Inventory } from 'src/database/entities/inventory.entity';


@Injectable()
export class InventoryService extends BaseSqlService<Inventory, IInventory> {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
  ) {
    super(inventoryRepository);
  }
}
