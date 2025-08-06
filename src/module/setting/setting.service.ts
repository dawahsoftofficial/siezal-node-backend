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
        private readonly productService: ProductService,
    ) {
        super(settingRepository);
    }

    async getHomepageSettings() {
        const settings = await this.settingRepository.findOne({
            where: { key: 'homepage' },
        });

        const homepageSettings = settings ? parseSettingValue(settings.value, settings.type) : [];

        const categories = await this.categoryService.findAll({ where: { slideShow: true } });

        const products = await this.productService.findAll({
            where: {
                status: EInventoryStatus.AVAILABLE,
                stockQuantity: MoreThan(0),
                categoryId: In(categories.map(category => category.id))
            },
            take: 12,
        });

        return {
            success: true,
            data: { featuredSlider: homepageSettings, categories, products },
        };
    }
}
