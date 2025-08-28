import { DataSource } from 'typeorm';
import { Inventory } from '../entities/inventory.entity';

export class InventorySeeder {
    public static async run(dataSource: DataSource): Promise<void> {
        const inventoryRepo = dataSource.getRepository(Inventory);

        const inventorys = [
            {
                longitude: 74.3587,
                latitude: 31.5204
            }
        ];

        await inventoryRepo.insert(inventorys);
        console.log('✅ Inventory seeded successfully');
    }
}
