import { InventoryService } from '../inventory.service';
import { AdminRouteController } from 'src/common/decorators/app.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Admin inventory')
@AdminRouteController('inventory')
export class AdminInventoryController {
  constructor(private readonly inventoryService: InventoryService) { }

}
