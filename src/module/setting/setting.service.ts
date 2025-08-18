import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseSqlService } from "src/core/base/services/sql.base.service";
import { In, MoreThan, Repository } from "typeorm";
import { ISetting } from "./interface/setting.interface";
import { Setting } from "src/database/entities/setting.entity";
import { parseSettingValue } from "src/common/utils/app.util";
import { CategoryService } from "../category/category.service";
import { ProductService } from "../product/product.service";
import { EInventoryStatus } from "src/common/enums/inventory-status.enum";

@Injectable()
export class SettingService extends BaseSqlService<Setting, ISetting> {
  constructor(
    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>,
    private readonly categoryService: CategoryService,
    private readonly productService: ProductService
  ) {
    super(settingRepository);
  }

  async getHomepageSettings() {
    const settings = await this.settingRepository.findOne({
      where: { key: "homepage" },
    });

    const homepageSettings = settings
      ? parseSettingValue(settings.value, settings.type)
      : [];

    const categories = await this.categoryService.findAll({
      where: { slideShow: true },
    });

    // Then for each category, fetch its limited products
    const categoryWithProducts = await Promise.all(
      categories.map(async (category) => {
        const products = await this.productService.findAll({
          where: {
            categoryId: category.id,
            status: EInventoryStatus.AVAILABLE,
            stockQuantity: MoreThan(0),
          },
          order: { updatedAt: "DESC" },
          take: 10,
        });

        return { ...category, products };
      })
    );

    return {
      featuredSlider: homepageSettings,
      categories: categoryWithProducts,
    };
  }
}
