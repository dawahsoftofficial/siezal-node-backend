import { HttpService } from "@nestjs/axios";
import {
  BadRequestException,
  Injectable,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";
import { AesHelper } from "src/common/helpers/aes.helper";
import { ProductBulkSyncItemDto } from "./dto/product-bulk-sync.dto";

interface IProductSyncPayload extends ProductBulkSyncItemDto {}

@Injectable()
export class ProductLiveSyncService {
  private readonly logger = new Logger(ProductLiveSyncService.name);
  private readonly baseUrl: string | null;
  private readonly defaultHeaders = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "Accept-Encoding": "gzip, deflate, br",
  };

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
              ...this.defaultHeaders,
              payload: payloadHeader,
            },
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
      this.logger.error(
        "Failed to authenticate against production API",
        error.response?.data ?? error.message
      );
      throw new BadRequestException("Unable to authenticate with production");
    }
  }

  async syncProducts(
    token: string,
    products: IProductSyncPayload[]
  ): Promise<void> {
    if (!products.length) {
      return;
    }

    const url = this.buildUrl("/admin/products/bulk-sync");
    const headers = {
      ...this.defaultHeaders,
      Authorization: `Bearer ${token}`,
    };
    const batchSize = 50;

    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      try {
        await firstValueFrom(
          this.httpService.post(
            url,
            { products: batch },
            {
              headers,
            }
          )
        );
      } catch (error) {
        this.logger.error(
          "Failed to sync products with production",
          error.response?.data ?? error.message
        );
        throw new BadRequestException("Unable to sync products on production");
      }
    }
  }
}
