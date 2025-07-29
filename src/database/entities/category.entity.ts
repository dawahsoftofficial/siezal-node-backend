import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from 'src/core/base/entity/entity.base';
import { ICategory } from 'src/module/category/interface/category.interface';

@Entity({ name: 'categories' })
export class Category extends BaseEntity implements ICategory {
    @Column({ name: 'name', type: 'varchar' })
    name: string;

    @Column({ name: 'slug', type: 'varchar' })
    slug: string;

    @Column({ name: 'parent_id', type: 'int', nullable: true })
    parentId?: number;

    @ManyToOne(() => Category, { nullable: true })
    @JoinColumn({ name: 'parent_id' })
    parentCategory?: Category;
}
