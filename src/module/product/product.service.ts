import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseSqlService } from "src/core/base/services/sql.base.service";
import { Product } from "src/database/entities/product.entity";
import { Brackets, In, Repository } from "typeorm";
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
import { SettingService } from "../setting/setting.service";
import { EInventoryStatus } from "src/common/enums/inventory-status.enum";
import { ProductLiveSyncService } from "./product-sync.service";
import { ProductBulkSyncItemDto } from "./dto/product-bulk-sync.dto";
import { Category } from "src/database/entities/category.entity";

@Injectable()
export class ProductService extends BaseSqlService<Product, IProduct> {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly s3Service: S3Service,
    private readonly productLiveSyncService: ProductLiveSyncService,
    @Inject(forwardRef(() => SettingService))
    private readonly settingService: SettingService
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

    if (filters.price) {
      const setting = await this.settingService.findOne({
        where: { key: "replacementProductPriceRange" },
      });

      const priceRangePercentage = Number(setting?.value || 0);
      const minPrice =
        filters.price - (filters.price * priceRangePercentage) / 100;
      const maxPrice =
        filters.price + (filters.price * priceRangePercentage) / 100;

      qb.andWhere("product.price BETWEEN :minPrice AND :maxPrice", {
        minPrice,
        maxPrice,
      });
    }

    if (typeof filters.imported === 'boolean') {
      qb.andWhere("product.imported = :imported", {
        imported: filters.imported,
      });
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
      .leftJoin("product.category", "category")
      .where("product.status = :status", {
        status: EInventoryStatus.AVAILABLE,
      }).andWhere("product.imported = :imported", {
        imported: false
      });

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

  async bulkSync(products: ProductBulkSyncItemDto[]) {
    if (!products.length) {
      return { created: 0, updated: 0 };
    }

    const normalize = (value: string) => value.trim().toLowerCase();
    const titles = Array.from(new Set(products.map((p) => normalize(p.title))));

    const existingProducts = await this.productRepository
      .createQueryBuilder("product")
      .where("LOWER(product.title) IN (:...titles)", { titles })
      .getMany();

    const existingMap = new Map(
      existingProducts.map((product) => [normalize(product.title), product])
    );

    const categorySlugs = Array.from(
      new Set(
        products
          .map((p) => p.categorySlug?.trim().toLowerCase())
          .filter(Boolean) as string[]
      )
    );

    const categories = categorySlugs.length
      ? await this.categoryRepository.find({
          where: { slug: In(categorySlugs) },
          select: ["id", "slug"],
        })
      : [];

    const categoryMap = new Map(
      categories.map((category) => [category.slug.toLowerCase(), category.id])
    );

    const toCreate: Product[] = [];
    const toUpdate: Product[] = [];

    for (const payload of products) {
      const key = normalize(payload.title);
      const existing = existingMap.get(key);

      if (existing) {
        existing.imported = true;
        existing.price = Number(payload.price);
        existing.salePrice = Number(payload.salePrice) || null;
        existing.description = payload.description;
        toUpdate.push(existing);
        continue;
      }

      const categoryId = categoryMap.get(payload.categorySlug.toLowerCase());
      if (!categoryId) {
        throw new BadRequestException(
          `Category with slug "${payload.categorySlug}" not found`
        );
      }

      const entity = this.productRepository.create({
        sku: payload.sku,
        title: payload.title,
        slug: payload.slug,
        shortDescription: payload.shortDescription ?? null,
        description: payload.description ?? null,
        seoTitle: payload.seoTitle ?? null,
        seoDescription: payload.seoDescription ?? null,
        price: Number(payload.price),
        salePrice:
          typeof payload.salePrice === "number"
            ? Number(payload.salePrice)
            : null,
        stockQuantity: payload.stockQuantity,
        status: payload.status,
        categoryId,
        inventoryId: payload.inventoryId,
        unit: payload.unit,
        isGstEnabled: payload.isGstEnabled,
        gstFee:
          payload.isGstEnabled && typeof payload.gstFee === "number"
            ? payload.gstFee
            : null,
        image: payload.image,
        imported: true,
      } as Product);

      toCreate.push(entity);
    }

    if (toUpdate.length) {
      await this.productRepository.save(toUpdate);
    }

    if (toCreate.length) {
      await this.productRepository.save(toCreate);
    }

    return {
      created: toCreate.length,
      updated: toUpdate.length,
    };
  }

  async syncLive(): Promise<void> {
    const token = await this.productLiveSyncService.authenticate();
    const products = await this.productRepository.find({
      relations: ["category"],
    });

    if (!products.length) {
      return;
    }

    const payload: ProductBulkSyncItemDto[] = products.map((product) => {
      if (!product.category?.slug) {
        throw new BadRequestException(
          `Product "${product.title}" is missing category slug`
        );
      }
      return {
        title: product.title,
        slug: product.slug,
        categorySlug: product.category.slug,
        sku: product.sku,
        shortDescription: product.shortDescription ?? undefined,
        description: product.description ?? undefined,
        seoTitle: product.seoTitle ?? undefined,
        seoDescription: product.seoDescription ?? undefined,
        price: Number(product.price),
        salePrice: product.salePrice ? Number(product.salePrice) : undefined,
        stockQuantity: product.stockQuantity,
        status: product.status,
        inventoryId: product.inventoryId,
        unit: product.unit,
        isGstEnabled: product.isGstEnabled,
        gstFee: product.gstFee ?? undefined,
        image: product.image,
      };
    });

    await this.productLiveSyncService.syncProducts(token, payload);
  }
}
