import { Injectable, NotFoundException } from "@nestjs/common";
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

@Injectable()
export class CategoryService extends BaseSqlService<Category, ICategory> {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly s3Service: S3Service
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
    return this.paginate<ICategory>(page, limit, {
      where: { parentId: IsNull() },
      order: {
        position: "ASC",
      },
    });
  };

  indexAdmin = async ({
    page,
    limit,
    q,
    sortBy,
    sortDirection,
  }: CategoryListQueryDtoAdmin) => {
    const where: FindOptionsWhere<Category> = limit === 1000 ? {} : { parentId: IsNull() };

    if (q) {
      Object.assign(where, [
        { name: Like(`%${q}%`), parentId: null },
        { slug: Like(`%${q}%`), parentId: null },
      ]);
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
}
