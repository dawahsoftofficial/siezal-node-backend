import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseSqlService } from "src/core/base/services/sql.base.service";
import { Product } from "src/database/entities/product.entity";
import { Between, Brackets, In, Repository } from "typeorm";
import type { SelectQueryBuilder } from "typeorm";
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
import { ProductImage } from "src/database/entities/product-image.entity";
import { Branch } from "src/database/entities/branch.entity";
import slugify from "slugify";
import { CreateVendorProductDto } from "../vendor/dto/vendor-product.dto";
import { UpdateVendorProductDto } from "../vendor/dto/update-vendor-product.dto";
import { EProductUnit } from "src/common/enums/product-unit.enum";
import {
  ProductCsvImportChunkDto,
  ProductCsvImportFinalizeDto,
  ProductCsvImportRowDto,
} from "./dto/product-csv-import.dto";

@Injectable()
export class ProductService extends BaseSqlService<Product, IProduct> {
  private static readonly PLACEHOLDER_IMAGE_URL =
    "https://siezal-next.vercel.app/placeholder.svg";

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
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
  ): Promise<
    IPaginatedResponse<IProduct> & {
      extra: {
        imageCounts: {
          with: number;
          without: number;
        };
      };
    }
  > {
    const qb = this.productRepository
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.inventory", "inventory")
      .leftJoinAndSelect("product.attributePivots", "attributePivots")
      .leftJoinAndSelect("attributePivots.attribute", "attribute")
      .leftJoinAndSelect("product.category", "category")
      .leftJoinAndSelect("product.branch", "branch");

    if (filters.q) {
      const searchTerm = `%${filters.q}%`;
      qb.andWhere(
        new Brackets((qb) => {
          qb.where("product.title LIKE :q", { q: searchTerm })
            .orWhere(
              "JSON_SEARCH(product.sku, 'one', :skuQuery, NULL, '$[*]') IS NOT NULL",
              { skuQuery: searchTerm }
            )
            .orWhere("category.name LIKE :q", { q: searchTerm })
            .orWhere("category.slug LIKE :q", { q: searchTerm });
        })
      );
    }

    if (filters.category) {
      qb.andWhere("category.slug = :slug", { slug: filters.category });
    }

    if (filters.generalOnly) {
      qb.andWhere("product.branchId IS NULL");
    } else if (filters.branchId) {
      qb.andWhere("product.branchId = :branchId", {
        branchId: filters.branchId,
      });
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

    if (filters.stockStatus) {
      qb.andWhere("product.status = :stockStatus", {
        stockStatus: filters.stockStatus,
      });
    }

    const countsQb = qb.clone();

    if (filters.imageState === "with") {
      this.applyImageStateFilter(qb, "with");
    } else if (filters.imageState === "without") {
      this.applyImageStateFilter(qb, "without");
    }

    qb.skip((page - 1) * limit)
      .take(limit)
      .orderBy(
        typeof filters.imported === "boolean" && filters.imported
          ? "product.updatedAt"
          : "product.createdAt",
        "DESC",
      )
      .addOrderBy("product.createdAt", "DESC");

    const [data, total] = await qb.getManyAndCount();

    const plainObjects = instanceToPlain(data) as IProduct[];
    const pagination: IPaginationMetadata = getPaginationMetadata(
      total,
      page,
      limit
    );
    const imageCounts = await this.getImageCounts(countsQb);

    return {
      data: plainObjects,
      pagination,
      extra: {
        imageCounts,
      },
    };
  }

  private applyImageStateFilter(
    qb: SelectQueryBuilder<Product>,
    imageState: "with" | "without",
  ) {
    const placeholderImageUrl = ProductService.PLACEHOLDER_IMAGE_URL;

    if (imageState === "with") {
      qb.andWhere(
        "product.image IS NOT NULL AND TRIM(product.image) != '' AND product.image != :placeholderImageUrl",
        { placeholderImageUrl },
      );

      return;
    }

    qb.andWhere(
      "(product.image IS NULL OR TRIM(product.image) = '' OR product.image = :placeholderImageUrl)",
      { placeholderImageUrl },
    );
  }

  private async getImageCounts(baseQb: SelectQueryBuilder<Product>) {
    const withCountQb = baseQb.clone();
    const withoutCountQb = baseQb.clone();

    this.applyImageStateFilter(withCountQb, "with");
    this.applyImageStateFilter(withoutCountQb, "without");

    const [withImage, withoutImage] = await Promise.all([
      withCountQb.getCount(),
      withoutCountQb.getCount(),
    ]);

    return {
      with: withImage,
      without: withoutImage,
    };
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
      .leftJoin("product.branch", "branch")
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

    if (filters.branchId) {
      qb.andWhere("product.branchId = :branchId", {
        branchId: filters.branchId,
      });
    } else if (filters.generalOnly) {
      qb.andWhere("product.branchId IS NULL");
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
        "branch.id",
        "branch.name",
      ]);
    } else {
      qb.addSelect(["category.slug", "branch.id", "branch.name"]);
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
    image?: Express.Multer.File
  ): Promise<IProduct> {
    if (body.branchId) {
      const branch = await this.branchRepository.findOne({
        where: { id: body.branchId },
      });

      if (!branch) {
        throw new NotFoundException(`Branch with ID ${body.branchId} not found`);
      }
    }

    if (image?.buffer instanceof Buffer) {
      const { url } = await this.s3Service.uploadImage(image);

      return await this.create({ ...body, image: url });
    }

    return await this.create({
      ...body,
      image: body.image || ProductService.PLACEHOLDER_IMAGE_URL,
    });
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

    if (body.branchId) {
      const branch = await this.branchRepository.findOne({
        where: { id: body.branchId },
      });

      if (!branch) {
        throw new NotFoundException(`Branch with ID ${body.branchId} not found`);
      }
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

  async updateImage(id: number, image: string): Promise<IProduct> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const nextImage = image?.trim();

    if (!nextImage) {
      throw new BadRequestException("Image URL is required");
    }

    product.image = nextImage;

    return await this.productRepository.save(product);
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

  async bulkDeleteByDateRange(dateRange: string): Promise<number> {
    const [startRaw, endRaw] = dateRange.split("-");

    const parseDate = (value: string, endOfDay = false) => {
      const [dayStr, monthStr, yearStr] = value.split("/");
      const day = Number(dayStr);
      const month = Number(monthStr);
      const year = Number(yearStr);

      const date = endOfDay
        ? new Date(year, month - 1, day, 23, 59, 59, 999)
        : new Date(year, month - 1, day, 0, 0, 0, 0);

      const isValid =
        !isNaN(date.getTime()) &&
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day;

      if (!isValid) {
        throw new BadRequestException("Invalid date range");
      }

      return date;
    };

    const startDate = parseDate(startRaw);
    const endDate = parseDate(endRaw, true);

    if (startDate > endDate) {
      throw new BadRequestException("Start date cannot be after end date");
    }

    const result = await this.productRepository.delete({
      createdAt: Between(startDate, endDate),
    });

    return result.affected || 0;
  }

  async bulkDeleteByBranch(branchId?: number): Promise<number> {
    const result = await this.productRepository.delete(
      branchId !== undefined ? { branchId } : { branchId: null as any },
    );

    return result.affected || 0;
  }

  async linkImages(date: string): Promise<{ linked: number; notFound: number }> {
    if (!date) {
      throw new BadRequestException("Date is required");
    }

    const targetDate = new Date(date);

    if (isNaN(targetDate.getTime())) {
      throw new BadRequestException("Invalid date format");
    }

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const images = await this.productImageRepository.find({
      where: {
        createdAt: Between(startOfDay, endOfDay),
      },
    });

    if (!images.length) {
      return { linked: 0, notFound: 0 };
    }

    const normalize = (value: string) => value.trim().toLowerCase();
    const titles = Array.from(new Set(images.map((img) => normalize(img.title))));

    const products = await this.productRepository
      .createQueryBuilder("product")
      .where("LOWER(product.title) IN (:...titles)", { titles })
      .getMany();

    const productMap = new Map(products.map((product) => [normalize(product.title), product]));

    const productsToUpdate: Product[] = [];
    let linked = 0;
    let notFound = 0;

    for (const image of images) {
      const product = productMap.get(normalize(image.title));

      if (product) {
        product.image = image.url;
        productsToUpdate.push(product);
        linked += 1;
      } else {
        notFound += 1;
      }
    }

    if (productsToUpdate.length) {
      await this.productRepository.save(productsToUpdate);
    }

    return { linked, notFound };
  }

  async bulkUploadProductImages(
    files: Express.Multer.File[],
    titles?: string[]
  ): Promise<{ saved: number }> {
    if (!files?.length) {
      throw new BadRequestException("No images provided");
    }

    const records: ProductImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const title = titles?.[i] || file.originalname;

      const { url } = await this.s3Service.uploadImage(file, "product-images");
      const entity = this.productImageRepository.create({
        title,
        url,
      });

      records.push(entity);
    }

    if (records.length) {
      await this.productImageRepository.save(records);
    }

    return { saved: records.length };
  }

  async findBySku(sku: string): Promise<Product | null> {
    return this.productRepository
      .createQueryBuilder("product")
      .where(
        "JSON_SEARCH(product.sku, 'one', :sku, NULL, '$[*]') IS NOT NULL",
        { sku },
      )
      .getOne();
  }

  private async findAllBySku(sku: string): Promise<Product[]> {
    return this.productRepository
      .createQueryBuilder("product")
      .where(
        "JSON_SEARCH(product.sku, 'one', :sku, NULL, '$[*]') IS NOT NULL",
        { sku },
      )
      .getMany();
  }

  private normalizeImportedSalePrice(
    regularPrice: number,
    salePrice?: number | null,
  ): number | null {
    if (salePrice === undefined || salePrice === null) {
      return null;
    }

    const normalizedSalePrice = Number(salePrice);

    if (!Number.isFinite(normalizedSalePrice) || normalizedSalePrice <= 0) {
      return null;
    }

    return normalizedSalePrice === Number(regularPrice)
      ? null
      : normalizedSalePrice;
  }

  private buildCsvImportSlug(
    title: string,
    itemCode: string,
    branchId: number | null,
  ) {
    const branchSuffix = branchId === null ? "general" : `branch-${branchId}`;

    return slugify(`${title}-${itemCode}-${branchSuffix}`, {
      lower: true,
      strict: true,
    }).slice(0, 255);
  }

  private async resolveCsvImportTargets(
    body: Pick<
      ProductCsvImportChunkDto,
      "applyToAllBranches" | "includeUnassigned" | "branchIds"
    >,
  ): Promise<Array<number | null>> {
    if (body.applyToAllBranches) {
      const branches = await this.branchRepository.find({
        where: { isActive: true },
        select: ["id"],
      });

      return branches.map((branch) => branch.id!);
    }

    const branchIds = Array.from(new Set(body.branchIds || []));

    if (branchIds.length) {
      const branches = await this.branchRepository.find({
        where: { id: In(branchIds) },
        select: ["id"],
      });
      const foundBranchIds = new Set(branches.map((branch) => branch.id));
      const missingBranchIds = branchIds.filter((id) => !foundBranchIds.has(id));

      if (missingBranchIds.length) {
        throw new BadRequestException(
          `Branch with ID "${missingBranchIds.join(", ")}" not found`
        );
      }
    }

    const targets: Array<number | null> = [
      ...branchIds,
      ...(body.includeUnassigned || !branchIds.length ? [null] : []),
    ];

    return targets;
  }

  private async resolveCsvImportDefaultCategoryId(
    defaultCategoryId?: number,
  ): Promise<number> {
    if (defaultCategoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: defaultCategoryId },
        select: ["id"],
      });

      if (!category) {
        throw new BadRequestException(
          `Category with ID "${defaultCategoryId}" not found`
        );
      }

      return category.id!;
    }

    const category = await this.categoryRepository.findOne({
      where: {},
      order: { id: "ASC" },
      select: ["id"],
    });

    if (!category) {
      throw new BadRequestException(
        "No category exists. Create a category before importing new products."
      );
    }

    return category.id!;
  }

  private buildCsvImportedProduct(
    row: ProductCsvImportRowDto,
    branchId: number | null,
    template: Product | null,
    defaultCategoryId: number,
  ): Product {
    const description = row.description?.trim() || undefined;
    const isAvailable = row.isAvailable !== false;

    return this.productRepository.create({
      sku: [row.itemCode],
      title: row.title,
      slug: this.buildCsvImportSlug(row.title, row.itemCode, branchId),
      shortDescription: description,
      description,
      seoTitle: template?.seoTitle ?? undefined,
      seoDescription: template?.seoDescription ?? undefined,
      price: Number(row.regularPrice),
      salePrice: this.normalizeImportedSalePrice(
        row.regularPrice,
        row.salePrice,
      ),
      stockQuantity:
        template?.stockQuantity && template.stockQuantity > 0
          ? template.stockQuantity
          : isAvailable
            ? 1
            : 0,
      status: isAvailable
        ? EInventoryStatus.AVAILABLE
        : EInventoryStatus.OUT_OF_STOCK,
      categoryId: template?.categoryId ?? defaultCategoryId,
      branchId,
      inventoryId: template?.inventoryId ?? 1,
      unit: template?.unit ?? EProductUnit.PIECE,
      isGstEnabled: false,
      gstFee: null,
      image:
        template?.image || "https://siezal-next.vercel.app/placeholder.svg",
      imported: true,
      importedNew: true,
    } as Product);
  }

  private async markMissingImportedProductsOutOfStock(
    itemCodes: string[],
    targetBranchIds: Array<number | null>,
  ): Promise<void> {
    const normalizedItemCodes = new Set(
      itemCodes.map((itemCode) => itemCode.trim().toLowerCase()).filter(Boolean),
    );
    const branchIds = targetBranchIds.filter(
      (branchId): branchId is number => branchId !== null,
    );

    const qb = this.productRepository.createQueryBuilder("product");

    if (branchIds.length && targetBranchIds.includes(null)) {
      qb.where("product.branchId IN (:...branchIds)", { branchIds }).orWhere(
        "product.branchId IS NULL",
      );
    } else if (branchIds.length) {
      qb.where("product.branchId IN (:...branchIds)", { branchIds });
    } else if (targetBranchIds.includes(null)) {
      qb.where("product.branchId IS NULL");
    } else {
      return;
    }

    const scopedProducts = await qb.getMany();
    const productsToUpdate = scopedProducts.filter((product) => {
      const productSkus = Array.isArray(product.sku) ? product.sku : [];

      return !productSkus.some((sku) =>
        normalizedItemCodes.has(String(sku).trim().toLowerCase()),
      );
    });

    if (!productsToUpdate.length) {
      return;
    }

    for (const product of productsToUpdate) {
      product.stockQuantity = 0;
      product.status = EInventoryStatus.OUT_OF_STOCK;
      product.imported = true;
    }

    await this.productRepository.save(productsToUpdate);
  }

  async importCsvChunk(body: ProductCsvImportChunkDto) {
    if (!body.rows.length) {
      return { processed: 0, created: 0, updated: 0, skipped: 0 };
    }

    const targetBranchIds = await this.resolveCsvImportTargets(body);
    const defaultCategoryId = await this.resolveCsvImportDefaultCategoryId(
      body.defaultCategoryId,
    );
    const toSave: Product[] = [];
    const seenItemCodes = new Set<string>();
    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const payload of body.rows) {
      const itemCode = payload.itemCode.trim();
      const title = payload.title.trim();
      const regularPrice = Number(payload.regularPrice);

      if (!itemCode || !title || !Number.isFinite(regularPrice)) {
        skipped += 1;
        continue;
      }

      const seenKey = itemCode.toLowerCase();

      if (seenItemCodes.has(seenKey)) {
        skipped += 1;
        continue;
      }

      seenItemCodes.add(seenKey);

      const row: ProductCsvImportRowDto = {
        ...payload,
        itemCode,
        title,
        regularPrice,
        isAvailable: payload.isAvailable !== false,
      };
      const existingProducts = await this.findAllBySku(itemCode);
      const template = existingProducts[0] || null;

      for (const branchId of targetBranchIds) {
        const existing = existingProducts.find(
          (product) => (product.branchId ?? null) === branchId,
        );
        const isAvailable = row.isAvailable !== false;

        if (existing) {
          existing.price = Number(row.regularPrice);
          existing.salePrice = this.normalizeImportedSalePrice(
            row.regularPrice,
            row.salePrice,
          );
          existing.status = isAvailable
            ? EInventoryStatus.AVAILABLE
            : EInventoryStatus.OUT_OF_STOCK;
          existing.stockQuantity =
            isAvailable && existing.stockQuantity <= 0
              ? 1
              : isAvailable
                ? existing.stockQuantity
                : 0;
          existing.imported = true;
          existing.importedNew = false;
          toSave.push(existing);
          updated += 1;
          continue;
        }

        toSave.push(
          this.buildCsvImportedProduct(
            row,
            branchId,
            template,
            defaultCategoryId,
          ),
        );
        created += 1;
      }
    }

    if (toSave.length) {
      await this.productRepository.save(toSave);
    }

    return {
      processed: body.rows.length,
      created,
      updated,
      skipped,
    };
  }

  async finalizeCsvImport(body: ProductCsvImportFinalizeDto) {
    const targetBranchIds = await this.resolveCsvImportTargets(body);

    await this.markMissingImportedProductsOutOfStock(
      body.allItemCodes || [],
      targetBranchIds,
    );

    return {
      finalized: true,
      branchTargets: targetBranchIds.length,
      itemCodes: body.allItemCodes?.length || 0,
    };
  }

  private async resolveImportedCategoryId(categorySlug: string) {
    const category = await this.categoryRepository.findOne({
      where: { slug: categorySlug.trim().toLowerCase() },
      select: ["id", "slug"],
    });

    if (!category) {
      throw new BadRequestException(`Category with slug "${categorySlug}" not found`);
    }

    return category.id;
  }

  private async ensureBranchExists(branchId?: number | null) {
    if (branchId) {
      const branch = await this.branchRepository.findOne({
        where: { id: branchId },
      });

      if (!branch) {
        throw new BadRequestException(`Branch with ID "${branchId}" not found`);
      }
    }
  }

  async createImportedVendorProduct(body: CreateVendorProductDto): Promise<IProduct> {
    const existing = await this.findBySku(body.sku);

    if (existing) {
      throw new ConflictException(`Product with SKU "${body.sku}" already exists`);
    }

    const categoryId = await this.resolveImportedCategoryId(body.categorySlug);

    await this.ensureBranchExists(body.branchId);

    return this.create({
      sku: [body.sku],
      title: body.title,
      slug: body.slug || slugify(body.title, { lower: true, strict: true }),
      shortDescription: body.shortDescription ?? undefined,
      description: body.description ?? undefined,
      seoTitle: body.seoTitle ?? undefined,
      seoDescription: body.seoDescription ?? undefined,
      price: body.price,
      salePrice: body.salePrice ?? null,
      stockQuantity: body.stockQuantity,
      status: body.status,
      categoryId,
      branchId: body.branchId ?? null,
      inventoryId: body.inventoryId ?? 1,
      unit: body.unit,
      isGstEnabled: body.isGstEnabled,
      gstFee: body.isGstEnabled ? body.gstFee ?? null : null,
      image: body.image || "https://siezal-next.vercel.app/placeholder.svg",
      imported: true,
    });
  }

  private buildCreateVendorProductPayloadFromUpdate(
    sku: string,
    body: UpdateVendorProductDto,
  ): CreateVendorProductDto {
    const missingFields: string[] = [];

    if (body.title === undefined) {
      missingFields.push("title");
    }

    if (body.categorySlug === undefined) {
      missingFields.push("categorySlug");
    }

    if (body.price === undefined) {
      missingFields.push("price");
    }

    if (body.stockQuantity === undefined) {
      missingFields.push("stockQuantity");
    }

    if (body.status === undefined) {
      missingFields.push("status");
    }

    if (body.unit === undefined) {
      missingFields.push("unit");
    }

    if (body.isGstEnabled === undefined) {
      missingFields.push("isGstEnabled");
    }

    if (missingFields.length) {
      throw new BadRequestException(
        `Product with SKU "${sku}" not found. To create it through this endpoint, provide: ${missingFields.join(", ")}`
      );
    }

    return {
      sku: body.sku || sku,
      title: body.title!,
      slug: body.slug,
      categorySlug: body.categorySlug!,
      shortDescription: body.shortDescription,
      description: body.description,
      seoTitle: body.seoTitle,
      seoDescription: body.seoDescription,
      price: body.price!,
      salePrice: body.salePrice,
      stockQuantity: body.stockQuantity!,
      status: body.status!,
      branchId: body.branchId,
      inventoryId: body.inventoryId,
      unit: body.unit!,
      isGstEnabled: body.isGstEnabled!,
      gstFee: body.gstFee,
      image: body.image,
    };
  }

  private async updateImportedVendorProduct(
    product: Product,
    body: UpdateVendorProductDto,
  ): Promise<IProduct> {
    let relationPayload: { categoryId?: number; branchId?: number | null } = {};

    if (body.categorySlug) {
      relationPayload.categoryId = await this.resolveImportedCategoryId(body.categorySlug);
    }

    if (body.branchId !== undefined) {
      await this.ensureBranchExists(body.branchId);
      relationPayload.branchId = body.branchId ?? null;
    }

    const updatedProduct = this.productRepository.merge(product, {
      ...(body.sku ? { sku: [body.sku] } : {}),
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.slug !== undefined
        ? { slug: body.slug || slugify(body.title || product.title, { lower: true, strict: true }) }
        : {}),
      ...(body.shortDescription !== undefined ? { shortDescription: body.shortDescription } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.seoTitle !== undefined ? { seoTitle: body.seoTitle } : {}),
      ...(body.seoDescription !== undefined ? { seoDescription: body.seoDescription } : {}),
      ...(body.price !== undefined ? { price: body.price } : {}),
      ...(body.salePrice !== undefined ? { salePrice: body.salePrice } : {}),
      ...(body.stockQuantity !== undefined ? { stockQuantity: body.stockQuantity } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.inventoryId !== undefined ? { inventoryId: body.inventoryId } : {}),
      ...(body.unit !== undefined ? { unit: body.unit } : {}),
      ...(body.isGstEnabled !== undefined ? { isGstEnabled: body.isGstEnabled } : {}),
      ...(body.gstFee !== undefined ? { gstFee: body.gstFee } : {}),
      ...(body.image !== undefined ? { image: body.image } : {}),
      ...relationPayload,
      imported: true,
    });

    if (body.isGstEnabled === false) {
      updatedProduct.gstFee = null;
    }

    return this.productRepository.save(updatedProduct);
  }

  async upsertImportedVendorProductBySku(
    sku: string,
    body: UpdateVendorProductDto,
  ): Promise<{ product: IProduct; created: boolean }> {
    const product = await this.findBySku(sku);

    if (!product) {
      const createBody = this.buildCreateVendorProductPayloadFromUpdate(sku, body);

      return {
        product: await this.createImportedVendorProduct(createBody),
        created: true,
      };
    }

    return {
      product: await this.updateImportedVendorProduct(product, body),
      created: false,
    };
  }

  async updateImportedVendorProductBySku(
    sku: string,
    body: UpdateVendorProductDto,
  ): Promise<IProduct> {
    const product = await this.findBySku(sku);

    if (!product) {
      throw new NotFoundException(`Product with SKU "${sku}" not found`);
    }

    return this.updateImportedVendorProduct(product, body);
  }

  async bulkSync(products: ProductBulkSyncItemDto[]) {
    if (!products.length) {
      return { created: 0, updated: 0 };
    }

    const normalize = (value: string) => value.trim().toLowerCase();
    const normalizeImportedSalePrice = (
      price: number,
      salePrice?: number | null
    ): number | null => {
      if (typeof salePrice !== "number") {
        return null;
      }

      const normalizedPrice = Number(price);
      const normalizedSalePrice = Number(salePrice);

      if (!Number.isFinite(normalizedSalePrice)) {
        return null;
      }

      return normalizedSalePrice === normalizedPrice ? null : normalizedSalePrice;
    };
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

    const branchIds = Array.from(
      new Set(
        products
          .map((p) => p.branchId)
          .filter((branchId): branchId is number => typeof branchId === "number")
      )
    );

    const branches = branchIds.length
      ? await this.branchRepository.find({
          where: { id: In(branchIds) },
          select: ["id"],
        })
      : [];

    const branchIdSet = new Set(branches.map((branch) => branch.id));

    const toCreate: Product[] = [];
    const toUpdate: Product[] = [];

    for (const payload of products) {
      if (payload.branchId && !branchIdSet.has(payload.branchId)) {
        throw new BadRequestException(
          `Branch with ID "${payload.branchId}" not found`
        );
      }

      const key = normalize(payload.title);
      const existing = existingMap.get(key);

      if (existing) {
        existing.imported = true;
        existing.sku = payload.sku ?? existing.sku;
        existing.price = Number(payload.price);
        existing.salePrice = normalizeImportedSalePrice(
          payload.price,
          payload.salePrice
        );
        existing.description = payload.description;
        existing.branchId = payload.branchId ?? null;
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
        sku: payload.sku?.length ? payload.sku : null,
        title: payload.title,
        slug: payload.slug,
        shortDescription: payload.shortDescription ?? null,
        description: payload.description ?? null,
        seoTitle: payload.seoTitle ?? null,
        seoDescription: payload.seoDescription ?? null,
        price: Number(payload.price),
        salePrice: normalizeImportedSalePrice(payload.price, payload.salePrice),
        stockQuantity: payload.stockQuantity,
        status: payload.status,
        categoryId,
        branchId: payload.branchId ?? null,
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
        sku: product.sku ?? [],
        shortDescription: product.shortDescription ?? undefined,
        description: product.description ?? undefined,
        seoTitle: product.seoTitle ?? undefined,
        seoDescription: product.seoDescription ?? undefined,
        price: Number(product.price),
        salePrice: product.salePrice ? Number(product.salePrice) : undefined,
        stockQuantity: product.stockQuantity,
        status: product.status,
        branchId: product.branchId ?? undefined,
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
