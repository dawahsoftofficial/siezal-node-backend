import { IEntityBase } from 'src/core/base/entity/interface/entity-interface.base';

export interface IInventory extends IEntityBase {
  longitude: number;
  latitude: number;
}