import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "src/core/base/entity/entity.base";
import { ICategory } from "src/module/category/interface/category.interface";

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
}
