import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseSqlService } from "src/core/base/services/sql.base.service";
import { Branch } from "src/database/entities/branch.entity";
import { FindOptionsWhere, IsNull, Like, Not, Repository } from "typeorm";
import { Product } from "src/database/entities/product.entity";
import {
  normalizeBranchServiceArea,
  normalizeBranchWeeklySchedule,
} from "./branch.utils";
import { CreateBranchDto, UpdateBranchDto } from "./dto/create-branch.dto";
import { IBranch } from "./interface/branch.interface";

type BranchProductSyncResult = {
  sourceBranchId: number;
  targetBranchId: number;
  scanned: number;
  targetBefore: number;
  targetAfter: number;
  created: number;
  updated: number;
  unchanged: number;
  skipped: number;
};

@Injectable()
export class BranchService extends BaseSqlService<Branch, IBranch> {
  constructor(
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {
    super(branchRepository);
  }

  async list(page: number, limit: number, query?: string, trash?: boolean) {
    let where: FindOptionsWhere<Branch>[] | FindOptionsWhere<Branch>;

    if (query) {
      const search = `%${query}%`;

      where = [
        { name: Like(search) },
        { address: Like(search) },
        { phone: Like(search) },
        { email: Like(search) },
      ];
    } else {
      where = {};
    }

    if (trash) {
      if (Array.isArray(where)) {
        where = where.map(item => ({
          ...item,
          deletedAt: Not(IsNull()),
        }));
      } else {
        where = {
          ...where,
          deletedAt: Not(IsNull()),
        };
      }

      const paginated = await this.paginate<IBranch>(page, limit, {
        where,
        withDeleted: true,
        order: { createdAt: "DESC" },
      });

      return {
        ...paginated,
        data: paginated.data.map(branch => this.normalizeBranch(branch)),
      };
    }

    const paginated = await this.paginate<IBranch>(page, limit, {
      where,
      order: { createdAt: "DESC" },
    });

    return {
      ...paginated,
      data: paginated.data.map(branch => this.normalizeBranch(branch)),
    };
  }

  async show(id: number) {
    const branch = await this.findOne({ where: { id } });

    if (!branch) {
      throw new NotFoundException("Branch not found");
    }

    return this.normalizeBranch(branch);
  }

  async listActive() {
    const branches = await this.findAll({
      where: {
        isActive: true,
        deletedAt: IsNull(),
      },
      order: {
        name: "ASC",
      },
    });

    return branches.map(branch => this.normalizeBranch(branch));
  }

  async createBranch(body: CreateBranchDto) {
    if (body.isPrimary) {
      await this.clearPrimaryBranches();
    }

    const created = await this.create({
      ...body,
      isActive: body.isActive ?? true,
      isEcommerceEnabled: body.isEcommerceEnabled ?? true,
      isPrimary: body.isPrimary ?? false,
      weeklySchedule: normalizeBranchWeeklySchedule(body.weeklySchedule),
      serviceArea: normalizeBranchServiceArea(body.serviceArea),
    });

    return this.normalizeBranch(created);
  }

  async updateBranch(id: number, body: UpdateBranchDto) {
    const branch = await this.branchRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!branch) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }

    const nextBody: UpdateBranchDto = { ...body };

    if (Object.prototype.hasOwnProperty.call(body, "weeklySchedule")) {
      nextBody.weeklySchedule = normalizeBranchWeeklySchedule(body.weeklySchedule);
    }

    if (Object.prototype.hasOwnProperty.call(body, "serviceArea")) {
      nextBody.serviceArea = normalizeBranchServiceArea(body.serviceArea);
    }

    if (body.isPrimary === true) {
      await this.clearPrimaryBranches(id);
    }

    const updatedBranch = this.branchRepository.merge(branch, nextBody);

    const savedBranch = await this.branchRepository.save(updatedBranch);

    return this.normalizeBranch(savedBranch);
  }

  async setPrimaryBranch(id: number) {
    const branch = await this.branchRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!branch) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }

    await this.clearPrimaryBranches(id);

    branch.isPrimary = true;

    const savedBranch = await this.branchRepository.save(branch);

    return this.normalizeBranch(savedBranch);
  }

  async syncProductsBetweenBranches(
    sourceBranchId: number,
    targetBranchId: number,
  ): Promise<BranchProductSyncResult> {
    if (sourceBranchId === targetBranchId) {
      throw new BadRequestException("Source and target branches must be different");
    }

    await this.assertBranchExists(sourceBranchId);
    await this.assertBranchExists(targetBranchId);

    const [sourceProducts, targetProducts, targetBefore] = await Promise.all([
      this.findProductsByBranch(sourceBranchId),
      this.findProductsByBranch(targetBranchId),
      this.countProductsByBranch(targetBranchId),
    ]);

    const targetBySku = new Map<string, Product>();
    const targetByInventoryId = new Map<number, Product>();

    targetProducts.forEach(product => {
      this.getProductSkuKeys(product).forEach(skuKey => {
        if (!targetBySku.has(skuKey)) {
          targetBySku.set(skuKey, product);
        }
      });

      if (product.inventoryId && !targetByInventoryId.has(product.inventoryId)) {
        targetByInventoryId.set(product.inventoryId, product);
      }
    });

    let created = 0;
    let updated = 0;
    let unchanged = 0;
    let skipped = 0;
    const productsToSave: Product[] = [];

    sourceProducts.forEach(sourceProduct => {
      const skuKeys = this.getProductSkuKeys(sourceProduct);

      // Try matching by SKU first, then fall back to inventoryId so that
      // products without a valid SKU are not silently skipped.
      let targetProduct: Product | undefined = skuKeys
        .map(skuKey => targetBySku.get(skuKey))
        .find(
          (product): product is Product =>
            product !== undefined && product.branchId === targetBranchId,
        );

      if (!targetProduct && sourceProduct.inventoryId) {
        targetProduct = targetByInventoryId.get(sourceProduct.inventoryId);
      }

      if (targetProduct) {
        const hasChanges =
          targetProduct.image !== sourceProduct.image ||
          targetProduct.title !== sourceProduct.title ||
          targetProduct.categoryId !== sourceProduct.categoryId;

        if (!hasChanges) {
          unchanged += 1;

          return;
        }

        targetProduct.image = sourceProduct.image;
        targetProduct.title = sourceProduct.title;
        targetProduct.categoryId = sourceProduct.categoryId;
        productsToSave.push(targetProduct);
        updated += 1;

        return;
      }

      productsToSave.push(this.createProductForBranch(sourceProduct, targetBranchId));
      created += 1;
    });

    if (productsToSave.length) {
      await this.productRepository.save(productsToSave);
    }

    const targetAfter = await this.countProductsByBranch(targetBranchId);

    return {
      sourceBranchId,
      targetBranchId,
      scanned: sourceProducts.length,
      targetBefore,
      targetAfter,
      created,
      updated,
      unchanged,
      skipped,
    };
  }

  async syncPrimaryProductsToAllBranches() {
    const primaryBranch = await this.branchRepository.findOne({
      where: { isPrimary: true, deletedAt: IsNull() },
    });

    if (!primaryBranch?.id) {
      throw new BadRequestException("Primary branch is not configured");
    }

    const branches = await this.branchRepository.find({
      where: { deletedAt: IsNull() },
      order: { name: "ASC" },
    });

    const targetBranches = branches.filter(
      branch => branch.id !== primaryBranch.id,
    );
    const results: BranchProductSyncResult[] = [];

    for (const branch of targetBranches) {
      if (!branch.id) {
        continue;
      }

      results.push(
        await this.syncProductsBetweenBranches(primaryBranch.id, branch.id),
      );
    }

    return {
      primaryBranchId: primaryBranch.id,
      branchesSynced: results.length,
      created: results.reduce((sum, result) => sum + result.created, 0),
      updated: results.reduce((sum, result) => sum + result.updated, 0),
      unchanged: results.reduce((sum, result) => sum + result.unchanged, 0),
      skipped: results.reduce((sum, result) => sum + result.skipped, 0),
      results,
    };
  }

  private async clearPrimaryBranches(exceptBranchId?: number) {
    const qb = this.branchRepository
      .createQueryBuilder()
      .update(Branch)
      .set({ isPrimary: false })
      .where("is_primary = :isPrimary", { isPrimary: true });

    if (exceptBranchId) {
      qb.andWhere("id != :exceptBranchId", { exceptBranchId });
    }

    await qb.execute();
  }

  private async assertBranchExists(id: number) {
    const branch = await this.branchRepository.findOne({ where: { id } });

    if (!branch) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }
  }

  private async findProductsByBranch(branchId: number) {
    return this.productRepository
      .createQueryBuilder("product")
      .where("product.branch_id = :branchId", { branchId })
      .andWhere("product.imported = :imported", { imported: false })
      .getMany();
  }

  private async countProductsByBranch(branchId: number) {
    return this.productRepository
      .createQueryBuilder("product")
      .where("product.branch_id = :branchId", { branchId })
      .andWhere("product.imported = :imported", { imported: false })
      .getCount();
  }

  private getProductSkuKeys(product: Product) {
    if (!Array.isArray(product.sku)) {
      return [];
    }

    return Array.from(
      new Set(
        product.sku
          .map(sku => String(sku).trim().toLowerCase())
          .filter(Boolean),
      ),
    );
  }

  private createProductForBranch(sourceProduct: Product, branchId: number) {
    return this.productRepository.create({
      sku: sourceProduct.sku,
      imported: sourceProduct.imported,
      title: sourceProduct.title,
      slug: sourceProduct.slug,
      shortDescription: sourceProduct.shortDescription,
      description: sourceProduct.description,
      seoTitle: sourceProduct.seoTitle,
      seoDescription: sourceProduct.seoDescription,
      price: sourceProduct.price,
      salePrice: sourceProduct.salePrice,
      stockQuantity: sourceProduct.stockQuantity,
      unit: sourceProduct.unit,
      isGstEnabled: sourceProduct.isGstEnabled,
      gstFee: sourceProduct.gstFee,
      status: sourceProduct.status,
      categoryId: sourceProduct.categoryId,
      branchId,
      inventoryId: sourceProduct.inventoryId,
      image: sourceProduct.image,
    });
  }

  private normalizeBranch(branch: IBranch): IBranch {
    return {
      ...branch,
      weeklySchedule: normalizeBranchWeeklySchedule(branch.weeklySchedule),
      serviceArea: normalizeBranchServiceArea(branch.serviceArea),
    };
  }
}
