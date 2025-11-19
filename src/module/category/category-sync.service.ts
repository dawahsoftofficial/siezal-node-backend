import { HttpService } from "@nestjs/axios";
import {
  BadRequestException,
  Injectable,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";
import { CategoryBulkCreateItemDto } from "./dto/category-bulk-create.dto";
import { AesHelper } from "src/common/helpers/aes.helper";

type TProdCategory = {
  slug: string;
};

@Injectable()
export class CategoryLiveSyncService {
  private readonly logger = new Logger(CategoryLiveSyncService.name);
  private readonly baseUrl: string | null;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly aesHelper: AesHelper
  ) {
    const rawBaseUrl = this.configService.get<string>("PRD_BASE_URL");
    this.baseUrl = rawBaseUrl ? rawBaseUrl.replace(/\/$/, "") : null;
  }

  private buildUrl(path: string): string {
    if (!this.baseUrl) {
      throw new BadRequestException(
        "PRD_BASE_URL is not configured for live sync"
      );
    }
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${this.baseUrl}${normalizedPath}`;
  }

  private buildPayload(fullUrl: string, method: string) {
    const publicSecret = this.configService.get<string>("PRD_PUB_Q");
    if (!publicSecret) {
      throw new BadRequestException(
        "PRD_PUB_Q is not configured for live sync payloads"
      );
    }
    const path = new URL(fullUrl).pathname;

    return this.aesHelper.encryptData(
      `${path}${method}${publicSecret}`,
      this.configService.get<string>("AES_IV"),
      this.configService.get<string>("AES_OPEN")
    );
  }

  async authenticate(): Promise<string> {
    const email = this.configService.get<string>("PRD_SYNC_EMAIL");
    const password = this.configService.get<string>("PRD_SYNC_PASSWORD");
    if (!email || !password) {
      throw new BadRequestException(
        "PRD_SYNC_EMAIL and PRD_SYNC_PASSWORD must be configured"
      );
    }
    const url = this.buildUrl("/admin/auth/login");
    const payloadHeader = this.buildPayload(url, "POST");
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(
          url,
          { email, password },
          {
            headers: {
              payload: payloadHeader,
              Accept: "application/json",
              "Content-Type": "application/json",
              "Accept-Encoding": "gzip, deflate, br",
            }
          }
        )
      );
      if (!data?.accessToken) {
        throw new BadRequestException(
          "Production login did not return an access token"
        );
      }
      return data.accessToken;
    } catch (error) {
      this.logger.error("Failed to authenticate against production API", error.response.data);
      throw new BadRequestException("Unable to authenticate with production");
    }
  }

  async fetchCategories(token: string): Promise<TProdCategory[]> {
    const url = this.buildUrl("/admin/categories/index");
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(url, {
          params: { limit: 999 },
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
            "Accept-Encoding": "gzip, deflate, br",
          },
        })
      );
      return data?.data ?? [];
    } catch (error) {
      this.logger.error("Failed to fetch categories from production", error);
      throw new BadRequestException(
        "Unable to fetch categories from production"
      );
    }
  }

  async bulkCreateCategories(
    token: string,
    categories: CategoryBulkCreateItemDto[]
  ): Promise<void> {
    if (!categories.length) {
      return;
    }
    const url = this.buildUrl("/admin/categories/bulk-create");
    try {
      await firstValueFrom(
        this.httpService.post(
          url,
          { categories },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
              "Content-Type": "application/json",
              "Accept-Encoding": "gzip, deflate, br",
            },
          }
        )
      );
    } catch (error) {
      this.logger.error("Failed to bulk create production categories", error);
      throw new BadRequestException(
        "Unable to create categories on production"
      );
    }
  }
}
