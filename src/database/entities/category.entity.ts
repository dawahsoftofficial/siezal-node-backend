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

  @Column({ name: "icon", type: "varchar" })
  icon: string;

  @Column({ name: "slide_show", type: "boolean", default: false })
  slideShow: boolean;

  @Column({ name: "images", type: "json", nullable: true })
  images: string[];

  @Column({ name: "parent_id", type: "int", nullable: true })
  parentId?: number;

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
  })
  products?: IProduct[];
}
