import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseSqlService } from 'src/core/base/services/sql.base.service';
import { Repository } from 'typeorm';
import { ICategory } from './interface/category.interface';
import { Category } from 'src/database/entities/category.entity';
import { CategoryListQueryDto } from './dto/category-list-query.dto';


@Injectable()
export class CategoryService extends BaseSqlService<Category, ICategory> {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {
    super(categoryRepository);
  }

  index = async (query: CategoryListQueryDto) => {
    const { page, limit } = query;
    return this.paginate<ICategory>(page, limit);
  };
}
