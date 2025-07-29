import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from 'src/core/base/entity/entity.base';
import { Product } from './product.entity';
import { Attribute } from './attribute.entity';
import { IProductAttributePivot } from 'src/module/attribute/interface/product-attribute-pivot.interface';

@Entity({ name: 'product_attributes' })
export class ProductAttributePivot extends BaseEntity implements IProductAttributePivot {
    @Column({ name: 'product_id', type: 'int' })
    productId: number;

    @Column({ name: 'attribute_id', type: 'int' })
    attributeId: number;

    @ManyToOne(() => Product, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @ManyToOne(() => Attribute, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'attribute_id' })
    attribute: Attribute;
}
