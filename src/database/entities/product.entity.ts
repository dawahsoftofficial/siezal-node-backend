import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { BaseEntity } from "src/core/base/entity/entity.base";
import { IProduct } from "src/module/product/interface/product.interface";
import { EInventoryStatus } from "src/common/enums/inventory-status.enum";
import { Inventory } from "./inventory.entity";
import { ProductAttributePivot } from "./product-attributes.entity";
import { Category } from "./category.entity";
import { EProductUnit } from "src/common/enums/product-unit.enum";

@Entity({ name: "products" })
export class Product extends BaseEntity implements IProduct {
  @Column({ name: "sku", type: "varchar", length: 100, nullable: true })
  sku?: string;

  @Column({ name: "title", type: "varchar", length: 255 })
  title: string;

  @Column({ name: "slug", type: "varchar", length: 255 })
  slug: string;

  @Column({ name: "short_description", type: "text", nullable: true })
  shortDescription?: string;

  @Column({ name: "description", type: "text", nullable: true })
  description?: string;

  @Column({ name: "seo_title", type: "varchar", length: 255, nullable: true })
  seoTitle?: string;

  @Column({ name: "seo_description", type: "text", nullable: true })
  seoDescription?: string;

  @Column({ name: "price", type: "decimal", precision: 10, scale: 2 })
  price: number;

  @Column({
    name: "sale_price",
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: true,
  })
  salePrice?: number;

  @Column({ name: "stock_quantity", type: "int" })
  stockQuantity: number;

  @Column({
    name: "unit",
    type: "enum",
    enum: EProductUnit,
  })
  unit: EProductUnit;

  @Column({
    name: "is_gst_enabled",
    type: "boolean",
    default: false,
  })
  isGstEnabled: boolean;

  @Column({
    name: "gst_fee",
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: true,
  })
  gstFee?: number | null;

  @Column({
    name: "status",
    type: "enum",
    enum: EInventoryStatus,
  })
  status: EInventoryStatus;

  @Column({ name: "category_id", type: "int" })
  categoryId: number;

  @ManyToOne(() => Category)
  @JoinColumn({ name: "category_id" })
  category: Category;

  @ManyToOne(() => Inventory)
  @JoinColumn({ name: "inventory_id" })
  inventory: Inventory;

  @Column({ name: "inventory_id", type: "int" })
  inventoryId: number;

  @Column({ name: "image", type: "varchar", length: 1000 })
  image: string;

  // @Column({ name: 'gallery', type: 'json', nullable: true })
  // gallery?: string[];

  @OneToMany(() => ProductAttributePivot, (pivot) => pivot.product)
  attributePivots: ProductAttributePivot[];

  @BeforeInsert()
  @BeforeUpdate()
  normalizeGstFee() {
    if (!this.isGstEnabled) {
      this.gstFee = null;
    }
  }
}
