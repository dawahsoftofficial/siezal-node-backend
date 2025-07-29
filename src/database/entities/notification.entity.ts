import { Column, Entity } from 'typeorm';
import { BaseEntity } from 'src/core/base/entity/entity.base';
import { INotification } from 'src/module/notification/interface/notification.interface';

@Entity({ name: 'notifications' })
export class Notification extends BaseEntity implements INotification {
    @Column({ name: 'user_ids', type: 'json', nullable: true })
    userIds?: number[] | null;

    @Column({ name: 'title', type: 'varchar', length: 255 })
    title: string;

    @Column({ name: 'message', type: 'text' })
    message: string;

    @Column({ name: 'read', type: 'boolean', default: false })
    read: boolean;
}
