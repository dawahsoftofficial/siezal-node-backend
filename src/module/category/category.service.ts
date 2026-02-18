import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseSqlService } from "src/core/base/services/sql.base.service";
import {
  FindOptionsOrder,
  FindOptionsWhere,
  IsNull,
  Like,
  Not,
  Repository,
} from "typeorm";
import { instanceToPlain } from "class-transformer";
import { ICategory } from "./interface/category.interface";
import { Category } from "src/database/entities/category.entity";
import {
  CategoryListQueryDto,
  CategoryListQueryDtoAdmin,
} from "./dto/category-list-query.dto";
import { CreateCategoryBodyDto } from "./dto/category-create.dto";
import { S3Service } from "src/shared/aws/s3.service";
import {
  UpdateCategoryBodyDto,
  UpdateCategoryPositionsDto,
} from "./dto/category-update.dto";
import { ECategoryStatus } from "src/common/enums/category-status.enum";
import { getPaginationMetadata } from "src/common/utils/pagination.utils";
import { Product } from "src/database/entities/product.entity";
import { CategoryLiveSyncService } from "./category-sync.service";
import { EInventoryStatus } from "src/common/enums/inventory-status.enum";
import {
  CategoryBulkCreateItemDto,
} from "./dto/category-bulk-create.dto";
@Injectable()
export class CategoryService extends BaseSqlService<Category, ICategory> {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly s3Service: S3Service,
    private readonly categoryLiveSyncService: CategoryLiveSyncService
  ) {
    super(categoryRepository);
  }

  async createCategory(
    body: CreateCategoryBodyDto,
    files: { icon?: Express.Multer.File[]; images?: Express.Multer.File[] }
  ): Promise<ICategory> {
    let iconUrl: string | undefined;
    let imagesUrls: string[] = [];

    if (files.icon?.[0]) {
      const { url } = await this.s3Service.uploadImage(files.icon[0]);
      iconUrl = url;
    }

    if (files.images?.length) {
      for (const file of files.images) {
        const { url } = await this.s3Service.uploadImage(file);
        imagesUrls.push(url);
      }
    }

    const category = await this.categoryRepository.save({
      ...body,
      parentId: body.parentId !== -1 ? body.parentId : undefined,
      icon: iconUrl,
      images: imagesUrls,
      status: body.status ?? ECategoryStatus.PUBLISHED,
    });

    return category;
  }

  async updateCategory(
    id: number,
    body: UpdateCategoryBodyDto,
    files: { icon?: Express.Multer.File[]; images?: Express.Multer.File[] }
  ) {
    const category = await this.categoryRepository.findOneBy({ id });

    if (!category) {
      throw new NotFoundException("Category not found");
    }

    Object.assign(category, {
      name: body.name,
      slug: body.slug,
      slideShow: body.slideShow,
      isFeatured: body.isFeatured,
      status: body.status ?? category.status,
    });

    // Handle icon update
    if (files.icon?.[0]) {
      const { url } = await this.s3Service.uploadImage(files.icon[0]);
      category.icon = url; // overwrite old
    }

    // Handle images update (decide replace vs append)
    if (files.images?.length) {
      const newUrls: string[] = [];

      for (const file of files.images) {
        const { url } = await this.s3Service.uploadImage(file);
        newUrls.push(url);
      }

      if (body.replaceImages) {
        // Replace existing
        category.images = newUrls;
      } else {
        // Append to existing
        category.images = [...(category.images || []), ...newUrls];
      }
    }

    // if (category.position !== body.position) {
    //   await this.categoryRepository.update({ position: body.position }, { position: category.position })
    // }

    Object.assign(category, {
      parentId: body.parentId !== -1 ? body.parentId : undefined,
    });

    return this.categoryRepository.save(category);
  }

  async updateCategoryPositions(
    body: UpdateCategoryPositionsDto
  ): Promise<void> {
    const updatePromises = body.data.map((item) =>
      this.categoryRepository.update(
        { id: item.id },
        { position: item.position }
      )
    );

    await Promise.all(updatePromises);
  }

  list = async () => {
    return this.findAll({
      where: { parentId: IsNull() },
      select: ["id", "name", "slug"],
    });
  };

  listChilds = async () => {
    return this.findAll({
      where: { parentId: Not(IsNull()) },

      select: ["id", "name", "slug"],
    });
  };

  index = async ({ page, limit }: CategoryListQueryDto) => {
    const currentPage = page ?? 1;
    const perPage = limit ?? 10;

    const qb = this.categoryRepository
      .createQueryBuilder("category")
      .where("category.parentId IS NULL")
      .andWhere("category.status = :status", {
        status: ECategoryStatus.PUBLISHED,
      })
      .orderBy("category.position", "ASC")
      .skip((currentPage - 1) * perPage)
      .take(perPage);

    const [categories, total] = await qb.getManyAndCount();

    return {
      data: instanceToPlain(categories) as ICategory[],
      pagination: getPaginationMetadata(total, currentPage, perPage),
    };
  };

  indexAdmin = async ({
    page,
    limit,
    q,
    sortBy,
    sortDirection,
  }: CategoryListQueryDtoAdmin) => {
    const baseWhere: FindOptionsWhere<Category> = {};

    if (limit !== 1000) {
      baseWhere.parentId = IsNull();
    }

    let where: FindOptionsWhere<Category> | FindOptionsWhere<Category>[] =
      baseWhere;

    if (q) {
      where = [
        { name: Like(`%${q}%`) },
        { slug: Like(`%${q}%`) },
      ];
    }

    const sortField =
      sortBy === "time"
        ? "createdAt"
        : sortBy === "name"
          ? "name"
          : "isFeatured";

    const sort: FindOptionsOrder<Category> = {
      [sortField]: (sortDirection || (sortBy === "time" ? "DESC" : "ASC")) as
        | "ASC"
        | "DESC",
    };

    return this.paginate<ICategory>(page, limit, {
      where,
      order: sort,
      relations: ["subCategories"],
    });
  };

  detail = async (slug: string) => {
    const category = await this.findOne({
      where: { slug, status: ECategoryStatus.PUBLISHED },
      relations: ["subCategories"],
      order: {
        subCategories: {
          position: "ASC",
        },
      },
    });

    if (category?.subCategories?.length) {
      const publishedSubCategoryIds = category.subCategories
        .filter((subCategory) => subCategory.status === ECategoryStatus.PUBLISHED)
        .map((subCategory) => subCategory.id);

      if (!publishedSubCategoryIds.length) {
        category.subCategories = [];
        return category;
      }

      const counts = await this.categoryRepository.manager
        .getRepository(Product)
        .createQueryBuilder("product")
        .select("product.categoryId", "categoryId")
        .addSelect("COUNT(product.id)", "count")
        .where("product.categoryId IN (:...ids)", { ids: publishedSubCategoryIds })
        .andWhere("product.status = :status", { status: EInventoryStatus.AVAILABLE })
        .andWhere("product.imported = :imported", { imported: false })
        .groupBy("product.categoryId")
        .getRawMany();

      const countMap = new Map<number, number>(
        counts.map((row) => [Number(row.categoryId), Number(row.count)])
      );

      category.subCategories = category.subCategories.filter(
        (subCategory) => (countMap.get(subCategory.id!) ?? 0) > 0
      );
    }

    return category;
  };

  detailAdmin = async (slug: string) => {
    return this.findOne({
      where: { slug },
      relations: ["subCategories"],
      order: {
        subCategories: {
          position: "ASC",
        },
      },
    });
  };

  async show(id: number) {
    const category = await this.categoryRepository.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException("Category not found");
    }

    return category;
  }

  async delete(id: number): Promise<void> {
    const result = await this.categoryRepository.delete(id);

    if (!result) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
  }

  async bulkCreate(
    categories: CategoryBulkCreateItemDto[]
  ): Promise<ICategory[]> {
    if (!categories.length) {
      return [];
    }

    const existing = await this.categoryRepository.find({
      select: ["id", "slug"],
    });
    const slugToId = new Map(existing.map(({ id, slug }) => [slug, id]));
    const created: ICategory[] = [];
    let queue = categories.map((category) => ({ ...category }));

    while (queue.length) {
      let createdInPass = false;
      const remaining: typeof queue = [];

      for (const category of queue) {
        if (category.parentSlug && !slugToId.has(category.parentSlug)) {
          remaining.push(category);
          continue;
        }

        const entity = this.categoryRepository.create({
          name: category.name,
          slug: category.slug,
          icon: category.icon ?? null,
          images: category.images ?? null,
          slideShow: category.slideShow,
          isFeatured: category.isFeatured,
          position: category.position,
          status: category.status ?? ECategoryStatus.PUBLISHED,
          parentId: category.parentSlug ? slugToId.get(category.parentSlug) : null,
        });

        const saved = await this.categoryRepository.save(entity);
        slugToId.set(saved.slug, saved.id);
        created.push(saved);
        createdInPass = true;
      }

      if (!createdInPass) {
        throw new BadRequestException(
          "Unable to resolve parent categories for bulk create"
        );
      }

      queue = remaining;
    }

    return created;
  }

  async syncLive(): Promise<void> {
    const token = await this.categoryLiveSyncService.authenticate();
    const [localCategories, prodCategories] = await Promise.all([
      this.categoryRepository.find({
        select: [
          "id",
          "name",
          "slug",
          "icon",
          "slideShow",
          "isFeatured",
          "position",
          "images",
          "status",
          "parentId",
        ],
        order: { position: "ASC" },
      }),
      this.categoryLiveSyncService.fetchCategories(token),
    ]);

    const prodSlugSet = new Set(prodCategories.map((cat) => cat.slug));
    const localById = new Map(localCategories.map((cat) => [cat.id, cat]));

    const pending = localCategories
      .filter((category) => !prodSlugSet.has(category.slug))
      .map<CategoryBulkCreateItemDto>((category) => ({
        name: category.name,
        slug: category.slug,
        icon: category.icon ?? undefined,
        images: category.images ?? undefined,
        slideShow: category.slideShow,
        isFeatured: category.isFeatured,
        position: category.position,
        status: category.status,
        parentSlug: category.parentId
          ? localById.get(category.parentId)?.slug
          : undefined,
      }));

    if (!pending.length) {
      return;
    }

    await this.categoryLiveSyncService.bulkCreateCategories(token, pending);
  }
}
