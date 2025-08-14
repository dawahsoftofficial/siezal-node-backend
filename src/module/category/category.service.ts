import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseSqlService } from "src/core/base/services/sql.base.service";
import { FindManyOptions, FindOptionsWhere, IsNull, Repository } from "typeorm";
import { ICategory } from "./interface/category.interface";
import { Category } from "src/database/entities/category.entity";
import { CategoryListQueryDto } from "./dto/category-list-query.dto";

@Injectable()
export class CategoryService extends BaseSqlService<Category, ICategory> {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>
  ) {
    super(categoryRepository);
  }

  fetchParentAndChildCat = async ({
    page,
    limit,
    parentSlug,
  }: CategoryListQueryDto) => {
    return this.paginate<ICategory>(page, limit, {
      where: parentSlug ? { slug: parentSlug } : { parentId: IsNull() },
      ...(parentSlug ? { relations: ["subCategories"] } : {}),
    });
  };
}
