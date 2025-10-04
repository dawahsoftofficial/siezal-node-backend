import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "src/core/base/entity/entity.base";
import { ICategory } from "src/module/category/interface/category.interface";
import { IProduct } from "src/module/product/interface/product.interface";
import { Product } from "./product.entity";

@Entity({ name: "categories" })
export class Category extends BaseEntity implements ICategory {
  @Column({ name: "name", type: "varchar" })
  name: string;

  @Column({ name: "slug", type: "varchar" })
  slug: string;

  @Column({ name: "icon", type: "varchar", nullable: true })
  icon: string | null;

  @Column({ name: "slide_show", type: "boolean", default: false })
  slideShow: boolean;

  @Column({ name: "is_featured", type: "boolean", default: false })
  isFeatured: boolean;

  @Column({ name: "position", type: "int" })
  position: number;

  @Column({ name: "images", type: "json", nullable: true })
  images: string[] | null;

  @Column({ name: "parent_id", type: "int", nullable: true })
  parentId?: number | null;

  @ManyToOne(() => Category, (category) => category.subCategories, {
    nullable: true,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "parent_id" })
  parentCategory?: ICategory;

  @OneToMany(() => Category, (category) => category.parentCategory, {
    cascade: true,
  })
  subCategories?: ICategory[];

  @OneToMany(() => Product, (data) => data.category, {
    cascade: true,
    onDelete: 'CASCADE'
  })
  products?: IProduct[];
}
