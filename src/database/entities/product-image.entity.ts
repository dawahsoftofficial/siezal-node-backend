import { Column, Entity } from "typeorm";
import { BaseEntity } from "src/core/base/entity/entity.base";
import { IProductImage } from "src/module/product/interface/product-image.interface";

@Entity({ name: "product_images" })
export class ProductImage extends BaseEntity implements IProductImage {
  @Column({ name: "title", type: "varchar", length: 255 })
  title: string;

  @Column({ name: "url", type: "varchar", length: 1000 })
  url: string;

  @Column({ name: "linked", type: "boolean", default: false })
  linked: boolean;
}
