import { Column, Entity } from 'typeorm';
import { BaseEntity } from 'src/core/base/entity/entity.base';
import { IInventory } from 'src/module/inventory/interface/inventory.interface';

@Entity({ name: 'inventory' })
export class Inventory extends BaseEntity implements IInventory {
    @Column({ name: 'longitude', type: 'double precision' })
    longitude: number;

    @Column({ name: 'latitude', type: 'double precision' })
    latitude: number;
}
