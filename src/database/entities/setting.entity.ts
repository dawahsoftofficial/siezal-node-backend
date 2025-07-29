import { Column, Entity } from 'typeorm';
import { BaseEntity } from 'src/core/base/entity/entity.base';
import { ISetting } from 'src/module/setting/interface/setting.interface';
import { ESettingType } from 'src/common/enums/setting-type.enum';

@Entity({ name: 'settings' })
export class Setting extends BaseEntity implements ISetting {
    @Column({ name: 'key', type: 'varchar', length: 100 })
    key: string;

    @Column({ name: 'value', type: 'text' })
    value: string;

    @Column({
        name: 'type',
        type: 'enum',
        enum: ESettingType,
    })
    type: ESettingType;
}
