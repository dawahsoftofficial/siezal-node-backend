import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseSqlService } from "src/core/base/services/sql.base.service";
import { Product } from "src/database/entities/product.entity";
import { Brackets, Repository } from "typeorm";
import { IProduct } from "./interface/product.interface";
import {
  IPaginatedResponse,
  IPaginationMetadata,
} from "src/common/interfaces/app.interface";
import { instanceToPlain } from "class-transformer";
import { getPaginationMetadata } from "src/common/utils/pagination.utils";
import { UpdateProductBodyDto } from "./dto/product-update.dto";
import { CreateProductBodyDto } from "./dto/product-create.dto";
import { S3Service } from "src/shared/aws/s3.service";

@Injectable()
export class ProductService extends BaseSqlService<Product, IProduct> {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly s3Service: S3Service
  ) {
    super(productRepository);
  }

  async indexAdmin(
    page: number,
    limit: number,
    filters: any,
    onlyList = false
  ): Promise<IPaginatedResponse<IProduct>> {
    const qb = this.productRepository
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.inventory", "inventory")
      .leftJoinAndSelect("product.attributePivots", "attributePivots")
      .leftJoinAndSelect("attributePivots.attribute", "attribute")
      .leftJoinAndSelect("product.category", "category");

    if (filters.q) {
      qb.andWhere(
        new Brackets((qb) => {
          qb.where("product.title LIKE :q", { q: `%${filters.q}%` })
            .orWhere("product.sku LIKE :q", { q: `%${filters.q}%` })
            .orWhere("category.name LIKE :q", { q: `%${filters.q}%` })
            .orWhere("category.slug LIKE :q", { q: `%${filters.q}%` });
        })
      );
    }

    if (filters.category) {
      qb.andWhere("category.slug = :slug", { slug: filters.category });
    }

    qb.skip((page - 1) * limit)
      .take(limit)
      .orderBy("product.createdAt", "DESC");

    const [data, total] = await qb.getManyAndCount();

    const plainObjects = instanceToPlain(data) as IProduct[];
    const pagination: IPaginationMetadata = getPaginationMetadata(total, page, limit);

    return { data: plainObjects, pagination };
  }

  async index(
    page: number,
    limit: number,
    filters: any,
    onlyList = false
  ): Promise<IPaginatedResponse<IProduct>> {
    const qb = this.productRepository
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.inventory", "inventory")
      .leftJoinAndSelect("product.attributePivots", "pivot")
      .leftJoinAndSelect("pivot.attribute", "attribute")
      .leftJoin("product.category", "category");

    if (filters.categoryId) {
      qb.andWhere("product.categoryId = :categoryId", {
        categoryId: filters.categoryId,
      });
    }

    if (filters.q) {
      qb.andWhere(
        "(LOWER(product.title) LIKE LOWER(:q) OR LOWER(product.description) LIKE LOWER(:q))",
        { q: `%${filters.q}%` }
      );
    }

    if (filters.tags?.length) {
      qb.andWhere(
        "(LOWER(attribute.name) IN (:...tags) OR CAST(attribute.id AS TEXT) IN (:...tags))",
        { tags: filters.tags.map((t) => t.toLowerCase()) }
      );
    }

    if (onlyList) {
      qb.select([
        "product.id",
        "product.sku",
        "product.title",
        "product.description",
        "product.price",
        "product.salePrice",
        "product.stockQuantity",
        "product.status",
        "product.createdAt",
        "category.id",
        "category.slug",
      ]);
    } else {
      qb.addSelect("category.slug");
    }

    qb.skip((page - 1) * limit)
      .take(limit)
      .orderBy("product.createdAt", "DESC");

    const [data, total] = await qb.getManyAndCount();

    const plainObjects = instanceToPlain(data) as IProduct[];

    const pagination: IPaginationMetadata = getPaginationMetadata(
      total,
      page,
      limit
    );

    return {
      data: plainObjects,
      pagination,
    };
  }

  async createProduct(
    body: CreateProductBodyDto,
    image: Express.Multer.File
  ): Promise<IProduct> {
    if (image.buffer instanceof Buffer) {
      const { url } = await this.s3Service.uploadImage(image);

      return await this.create({ ...body, image: url });
    }

    throw new NotFoundException(`Product image is not a valid file`);
  }

  async update(
    id: number,
    body: UpdateProductBodyDto,
    image?: Express.Multer.File
  ): Promise<IProduct> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    let updatedProduct;

    if (image && image.buffer instanceof Buffer) {
      const { url } = await this.s3Service.uploadImage(image);

      updatedProduct = this.productRepository.merge(product, {
        ...body,
        image: url,
      });
    } else {
      updatedProduct = this.productRepository.merge(product, body);
    }

    return await this.productRepository.save(updatedProduct);
  }

  async show(id: number) {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    return product;
  }

  async delete(id: number): Promise<void> {
    const result = await this.productRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }
}
