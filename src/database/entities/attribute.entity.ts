import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from 'src/core/base/entity/entity.base';
import { IAttribute } from 'src/module/attribute/interface/attribute.interface';

@Entity({ name: 'attributes' })
export class Attribute extends BaseEntity implements IAttribute {
    @Column({ name: 'name', type: 'varchar' })
    name: string;

    @Column({ name: 'slug', type: 'varchar' })
    slug: string;

    @Column({ name: 'parent_id', type: 'int', nullable: true })
    parentId?: number;

    @ManyToOne(() => Attribute, { nullable: true })
    @JoinColumn({ name: 'parent_id' })
    parent?: Attribute;
}
