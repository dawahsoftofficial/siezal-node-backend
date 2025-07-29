import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from 'src/core/base/entity/entity.base';
import { User } from './user.entity';
import { IFcmToken } from 'src/module/fcm-token/interface/fcm-token.interface';

@Entity({ name: 'fcm_tokens' })
export class FcmToken extends BaseEntity implements IFcmToken {
    @Column({ name: 'user_id', type: 'int' })
    userId: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'token', type: 'text' })
    token: string;
}
