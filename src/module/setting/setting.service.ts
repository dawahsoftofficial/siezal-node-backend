import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseSqlService } from "src/core/base/services/sql.base.service";
import { MoreThan, Not, Repository } from "typeorm";
import { ISetting } from "./interface/setting.interface";
import { Setting } from "src/database/entities/setting.entity";
import { parseSettingValue } from "src/common/utils/app.util";
import { CategoryService } from "../category/category.service";
import { ProductService } from "../product/product.service";
import { EInventoryStatus } from "src/common/enums/inventory-status.enum";
import { S3Service } from "src/shared/aws/s3.service";
import { ESettingType } from "src/common/enums/setting-type.enum";
import { UpdateSettingsDto } from "./dto/update-setting.dto";
import { DeleteAccountRequestDto } from "./dto/delete-account.dto";
import { EDeletionRequestStatus } from "src/common/enums/deletion-request-status.enum";
import { DeleteAccountRequest } from "src/database/entities/deletion-requests.entity";

@Injectable()
export class SettingService extends BaseSqlService<Setting, ISetting> {
  constructor(
    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>,
    
    @InjectRepository(DeleteAccountRequest)
    private readonly deleteAccountRequestRepository: Repository<DeleteAccountRequest>,
    private readonly categoryService: CategoryService,
    private readonly productService: ProductService,
    private readonly s3Service: S3Service
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
      relations: ["parentCategory"],
      where: { isFeatured: true },
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

  async handleDeleteAccountRequest(data: DeleteAccountRequestDto) {
    const deleteRequest = this.deleteAccountRequestRepository.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone || null,
      purpose: data.purpose || null,
      comments: data.comments || null,
      status: EDeletionRequestStatus.PENDING,
    });

    return await this.deleteAccountRequestRepository.save(deleteRequest);
  }
}
