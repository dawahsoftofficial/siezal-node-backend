import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { BaseEntity } from '../entity/entity.base';

@EventSubscriber()
export class BaseSubscriber implements EntitySubscriberInterface<BaseEntity> {
  /**
   * Called before entity insertion.
   */
  beforeInsert(event: InsertEvent<BaseEntity>) {
    const currentDate = new Date();
    event.entity.createdAt = currentDate;
    event.entity.updatedAt = currentDate;
  }

  /**
   * Called before entity update.
   */
  beforeUpdate(event: UpdateEvent<BaseEntity>) {
    event.entity && (event.entity.updatedAt = new Date());
  }
}
