import { InventoryService } from '../inventory.service';
import { UserRouteController } from 'src/common/decorators/app.decorator';

import { ApiTags } from '@nestjs/swagger';

@UserRouteController('inventory')
@ApiTags('Inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) { }


}