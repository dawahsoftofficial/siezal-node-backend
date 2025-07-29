import { Module } from '@nestjs/common';
import { InventoryController } from './controller/inventory-user.controller';
import { AdminInventoryController } from './controller/inventory-admin.controller';
import { InventoryService } from './inventory.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventory } from 'src/database/entities/inventory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Inventory])],
  controllers: [InventoryController, AdminInventoryController],
  providers: [InventoryService],
  exports: [InventoryService]
})
export class InventoryModule { }
