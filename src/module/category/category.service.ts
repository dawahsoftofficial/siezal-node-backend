import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseSqlService } from "src/core/base/services/sql.base.service";
import { FindOptionsWhere, IsNull, Like, Not, Repository } from "typeorm";
import { ICategory } from "./interface/category.interface";
import { Category } from "src/database/entities/category.entity";
import { CategoryListQueryDto, CategoryListQueryDtoAdmin } from "./dto/category-list-query.dto";
import { CreateCategoryBodyDto } from "./dto/category-create.dto";
import { S3Service } from "src/shared/aws/s3.service";
import { UpdateCategoryBodyDto } from "./dto/category-update.dto";

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

    if (category.position !== body.position) {
      await this.categoryRepository.update({ position: body.position }, { position: category.position })
    }

    Object.assign(category, { ...body, parentId: body.parentId !== -1 ? body.parentId : undefined });

    return this.categoryRepository.save(category);
  }

  list = async () => {
    return this.findAll({
      where: { parentId: IsNull() },
      select: ['id', 'name']
    });
  }
  
  listChilds = async () => {
    return this.findAll({
      where: { parentId: Not(IsNull()) },
      select: ['id', 'name']
    });
  }

  index = async ({ page, limit }: CategoryListQueryDto) => {
    return this.paginate<ICategory>(page, limit, {
      where: { parentId: IsNull() },
    });
  };

  indexAdmin = async ({ page, limit, q }: CategoryListQueryDtoAdmin) => {
    let where: FindOptionsWhere<Category>[] = []

    if (q) {
      where = [
        { name: Like(`%${q}%`) },
        { slug: Like(`%${q}%`) },
      ]
    }

    return this.paginate<ICategory>(page, limit, {
      where: where,
    });
  };

  detail = async (slug: string) => {
    return this.findOne({
      where: { slug },
      relations: ["subCategories"],
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

    if (result.affected === 0) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
  }
}
