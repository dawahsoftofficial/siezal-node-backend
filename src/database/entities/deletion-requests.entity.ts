import { Column, Entity } from 'typeorm';
import { BaseEntity } from 'src/core/base/entity/entity.base';
import { IDeleteAccountRequest } from 'src/module/setting/interface/deleteRequest.interface';
import { EDeletionRequestStatus } from 'src/common/enums/deletion-request-status.enum';

@Entity({ name: 'delete_account_requests' })
export class DeleteAccountRequest extends BaseEntity implements IDeleteAccountRequest {
    @Column({ name: 'first_name', type: 'varchar', length: 100 })
    firstName: string;

    @Column({ name: 'last_name', type: 'varchar', length: 100 })
    lastName: string;

    @Column({ name: 'email', type: 'varchar', length: 150 })
    email: string;

    @Column({ name: 'phone', type: 'varchar', length: 20, nullable: true })
    phone?: string | null;

    @Column({ name: 'purpose', type: 'text', nullable: true })
    purpose?: string | null;

    @Column({ name: 'comments', type: 'text', nullable: true })
    comments?: string | null;

    @Column({
        name: 'status',
        type: 'enum',
        enum: EDeletionRequestStatus,
    })
    status: EDeletionRequestStatus;
}
