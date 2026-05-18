import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseSqlService } from "src/core/base/services/sql.base.service";
import { IsNull, MoreThan, Not, Repository } from "typeorm";
import {
  defaultSmsConfig,
  ISetting,
  ISmsServiceSetting,
} from "./interface/setting.interface";
import { Setting } from "src/database/entities/setting.entity";
import { parseSettingValue } from "src/common/utils/app.util";
import { CategoryService } from "../category/category.service";
import { ProductService } from "../product/product.service";
import { EInventoryStatus } from "src/common/enums/inventory-status.enum";
import { S3Service } from "src/shared/aws/s3.service";
import { ESettingType } from "src/common/enums/setting-type.enum";
import { UpdateSettingsDto } from "./dto/update-setting.dto";
import { ECategoryStatus } from "src/common/enums/category-status.enum";

@Injectable()
export class SettingService extends BaseSqlService<Setting, ISetting> {
  constructor(
    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>,

    private readonly categoryService: CategoryService,

    @Inject(forwardRef(() => ProductService))
    private readonly productService: ProductService,

    private readonly s3Service: S3Service
  ) {
    super(settingRepository);
  }

  async getHomepageSettings(filters?: { branchId?: number; generalOnly?: boolean }) {
    const settings = await this.settingRepository.findOne({
      where: { key: "homepage" },
    });

    const homepageSettings = settings
      ? parseSettingValue(settings.value, settings.type)
      : [];

    const categories = await this.categoryService.findAll({
      relations: ["parentCategory", "subCategories"],
      where: {
        isFeatured: true,
        status: ECategoryStatus.PUBLISHED,
      },
      order: { position: "ASC" },
    });

    const categoryWithProducts = await Promise.all(
      categories.map(async (category) => {
        const categoryIds = [
          category.id,
          ...(category.subCategories?.map((subCategory) => subCategory.id) || []),
        ].filter((id): id is number => typeof id === "number");

        const productWhere = categoryIds.map((categoryId) => ({
          categoryId,
          status: EInventoryStatus.AVAILABLE,
          stockQuantity: MoreThan(0),
          imported: false,
          ...(filters?.branchId
            ? { branchId: filters.branchId }
            : filters?.generalOnly
              ? { branchId: IsNull() }
              : {}),
        }));

        const products = await this.productService.findAll({
          where: productWhere,
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

  async getGeneralSettings(key?: string) {
    const settings = await this.settingRepository.find(
      key
        ? {
            where: { key },
          }
        : { where: { key: Not("homepage") } }
    );

    // const parsedSettings = settings.map((item) => parseSettingValue(item.value, item.type))

    return settings;
  }

  async getHomepageSettingsAdmin() {
    const settings = await this.settingRepository.findOne({
      where: { key: "homepage" },
    });

    const homepageSettings: string[] = settings
      ? parseSettingValue(settings.value, settings.type)
      : [];

    return homepageSettings;
  }

  async saveHomepageSettingsAdmin(
    existingUrls: string[],
    newFiles: Express.Multer.File[]
  ): Promise<string[]> {
    const uploadedUrls: string[] = [];

    if (newFiles?.length) {
      for (const file of newFiles) {
        const { url } = await this.s3Service.uploadImage(file);
        uploadedUrls.push(url);
      }
    }

    const finalList = [...existingUrls, ...uploadedUrls];

    let setting = await this.settingRepository.findOne({
      where: { key: "homepage" },
    });

    if (setting) {
      setting.value = JSON.stringify(finalList);
      await this.settingRepository.save(setting);
    } else {
      setting = this.settingRepository.create({
        key: "homepage",
        type: ESettingType.JSON,
        value: JSON.stringify(finalList),
      });
      await this.settingRepository.save(setting);
    }

    return finalList;
  }

  async updateGeneralSettings(body: UpdateSettingsDto): Promise<Setting> {
    let setting = await this.settingRepository.findOne({
      where: { key: body.key },
    });

    if (setting) {
      setting.value = body.value;
      setting.key = body.key;
      setting.type = body.type;
      setting.title = body.title;

      return await this.settingRepository.save(setting);
    } else {
      setting = this.settingRepository.create({
        title: body.title || "General",
        key: body.key,
        type: body.type,
        value: body.value,
      });
      return await this.settingRepository.save(setting);
    }
  }

  async fetchSmsService(): Promise<ISmsServiceSetting> {
    try {
      const smsServiceData = await this.findOne({
        where: { key: "smsServices" },
      });

      if (!smsServiceData?.value) {
        return defaultSmsConfig;
      }

      try {
        const parsed = JSON.parse(smsServiceData.value);
        return parsed;
      } catch (error) {
        console.error("❌ Invalid JSON in smsServices:", error);
        return defaultSmsConfig;
      }
    } catch (error) {
      console.error("❌ Error fetching SMS service config:", error);
      return defaultSmsConfig;
    }
  }
}
