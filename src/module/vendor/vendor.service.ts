import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { JwtService as NestJwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { BaseSqlService } from "src/core/base/services/sql.base.service";
import { Vendor } from "src/database/entities/vendor.entity";
import { VendorLog } from "src/database/entities/vendor-log.entity";
import { VendorProductAudit } from "src/database/entities/vendor-product-audit.entity";
import {
  DataSource,
  EntityManager,
  FindOptionsWhere,
  Like,
  Repository,
} from "typeorm";
import { CreateVendorDto, UpdateVendorDto } from "./dto/create-vendor.dto";
import { IVendor } from "./interface/vendor.interface";
import { IVendorLog } from "./interface/vendor-log.interface";
import { generateRandomString, hashString } from "src/common/utils/app.util";
import { VendorLoginDto } from "./dto/vendor-login.dto";
import { IVendorTokenPayload } from "./interface/vendor-auth.interface";
import { ProductService } from "../product/product.service";
import { CreateVendorProductDto } from "./dto/vendor-product.dto";
import { UpdateVendorProductDto } from "./dto/update-vendor-product.dto";
import { IProduct } from "../product/interface/product.interface";

@Injectable()
export class VendorService extends BaseSqlService<Vendor, IVendor> {
  constructor(
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
    @InjectRepository(VendorLog)
    private readonly vendorLogRepository: Repository<VendorLog>,
    @InjectRepository(VendorProductAudit)
    private readonly vendorProductAuditRepository: Repository<VendorProductAudit>,
    private readonly jwtService: NestJwtService,
    private readonly configService: ConfigService,
    private readonly productService: ProductService,
    private readonly dataSource: DataSource,
  ) {
    super(vendorRepository);
  }

  async list(page: number, limit: number, query?: string) {
    let where: FindOptionsWhere<Vendor>[] | FindOptionsWhere<Vendor>;

    if (query) {
      const search = `%${query}%`;
      where = [
        { name: Like(search) },
        { code: Like(search) },
        { contactEmail: Like(search) },
      ];
    } else {
      where = {};
    }

    return this.paginate<IVendor>(page, limit, {
      where,
      order: { createdAt: "DESC" },
    });
  }

  async show(id: number) {
    const vendor = await this.findById(id);

    if (!vendor) {
      throw new NotFoundException("Vendor not found");
    }

    return vendor;
  }

  async createVendor(body: CreateVendorDto) {
    const existing = await this.vendorRepository.findOne({
      where: { code: body.code },
    });

    if (existing) {
      throw new ConflictException("Vendor code already exists");
    }

    return this.create({
      ...body,
      isActive: body.isActive ?? true,
    });
  }

  async updateVendor(id: number, body: UpdateVendorDto) {
    const vendor = await this.vendorRepository.findOne({ where: { id } });

    if (!vendor) {
      throw new NotFoundException("Vendor not found");
    }

    if (body.code && body.code !== vendor.code) {
      const existing = await this.vendorRepository.findOne({
        where: { code: body.code },
      });

      if (existing) {
        throw new ConflictException("Vendor code already exists");
      }
    }

    const updatedVendor = this.vendorRepository.merge(vendor, body);

    return this.vendorRepository.save(updatedVendor);
  }

  async generateCredentials(id: number) {
    const vendor = await this.vendorRepository.findOne({ where: { id } });

    if (!vendor) {
      throw new NotFoundException("Vendor not found");
    }

    const clientId = `vendor_${vendor.code}_${generateRandomString(10)}`;
    const clientSecret = generateRandomString(48);

    vendor.clientId = clientId;
    vendor.clientSecretHash = hashString(clientSecret);

    await this.vendorRepository.save(vendor);

    return {
      vendor,
      credentials: {
        clientId,
        clientSecret,
      },
    };
  }

  async rotateSecret(id: number) {
    const vendor = await this.vendorRepository.findOne({ where: { id } });

    if (!vendor) {
      throw new NotFoundException("Vendor not found");
    }

    if (!vendor.clientId) {
      return this.generateCredentials(id);
    }

    const clientSecret = generateRandomString(48);

    vendor.clientSecretHash = hashString(clientSecret);

    await this.vendorRepository.save(vendor);

    return {
      vendor,
      credentials: {
        clientId: vendor.clientId,
        clientSecret,
      },
    };
  }

  async loginVendor(dto: VendorLoginDto) {
    const vendor = await this.vendorRepository.findOne({
      where: { clientId: dto.clientId },
    });

    if (!vendor || !vendor.clientSecretHash) {
      throw new UnauthorizedException("Invalid credentials");
    }

    if (!vendor.isActive) {
      throw new UnauthorizedException("Vendor is inactive");
    }

    if (vendor.clientSecretHash !== hashString(dto.clientSecret)) {
      throw new UnauthorizedException("Invalid credentials");
    }

    vendor.lastLoginAt = new Date();
    await this.vendorRepository.save(vendor);

    const expiresIn =
      this.configService.get<string>("VENDOR_ACCESS_TOKEN_EXPIRES_IN") || "1d";
    const secret =
      this.configService.get<string>("VENDOR_ACCESS_TOKEN_SECRET") ||
      this.configService.getOrThrow<string>("JWT_ACCESS_SECRET");

    const payload: IVendorTokenPayload = {
      vendorId: vendor.id!,
      code: vendor.code,
      type: "vendor",
    };

    const accessToken = this.jwtService.sign(payload, {
      secret,
      expiresIn,
    });

    return {
      accessToken,
      expiresIn,
      vendor: {
        id: vendor.id,
        name: vendor.name,
        code: vendor.code,
      },
    };
  }

  async verifyVendorAccessToken(token: string): Promise<IVendorTokenPayload> {
    const secret =
      this.configService.get<string>("VENDOR_ACCESS_TOKEN_SECRET") ||
      this.configService.getOrThrow<string>("JWT_ACCESS_SECRET");

    const payload = this.jwtService.verify<IVendorTokenPayload>(token, {
      secret,
    });

    const vendor = await this.vendorRepository.findOne({
      where: { id: payload.vendorId },
    });

    if (!vendor || !vendor.isActive) {
      throw new UnauthorizedException("Vendor is inactive or missing");
    }

    return payload;
  }

  async createLog(
    payload: Omit<IVendorLog, "id" | "createdAt" | "updatedAt">,
    manager?: EntityManager,
  ) {
    const repository = manager
      ? manager.getRepository(VendorLog)
      : this.vendorLogRepository;

    return repository.save(repository.create(payload));
  }

  private buildProductSnapshot(product: IProduct): Record<string, unknown> {
    return {
      id: product.id ?? null,
      sku: product.sku ?? [],
      title: product.title,
      slug: product.slug,
      shortDescription: product.shortDescription ?? null,
      description: product.description ?? null,
      seoTitle: product.seoTitle ?? null,
      seoDescription: product.seoDescription ?? null,
      price: Number(product.price),
      salePrice:
        product.salePrice === null || product.salePrice === undefined
          ? null
          : Number(product.salePrice),
      stockQuantity: product.stockQuantity,
      status: product.status,
      categoryId: product.categoryId,
      branchId: product.branchId ?? null,
      inventoryId: product.inventoryId,
      unit: product.unit,
      isGstEnabled: product.isGstEnabled,
      gstFee:
        product.gstFee === null || product.gstFee === undefined
          ? null
          : Number(product.gstFee),
      image: product.image,
      imported: product.imported ?? true,
      importedNew: product.importedNew ?? false,
    };
  }

  private buildChangedFields(
    before: Record<string, unknown> | null,
    after: Record<string, unknown>,
  ) {
    const changes: Record<string, { before: unknown; after: unknown }> = {};

    for (const [field, afterValue] of Object.entries(after)) {
      if (field === "id") {
        continue;
      }

      const beforeValue = before?.[field] ?? null;

      if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) {
        changes[field] = { before: beforeValue, after: afterValue };
      }
    }

    return changes;
  }

  async createVendorProductWithAudit(
    vendor: IVendorTokenPayload,
    body: CreateVendorProductDto,
  ): Promise<IProduct> {
    return this.dataSource.transaction(async (manager) => {
      const product = await this.productService.createImportedVendorProduct(
        body,
        manager,
      );
      const responsePayload = { productId: product.id, sku: body.sku };
      const vendorLog = await this.createLog(
        {
          vendorId: vendor.vendorId,
          type: "product_create",
          endpoint: "/v1/integrations/vendor/products",
          method: "POST",
          requestPayload: body,
          responsePayload,
          statusCode: 200,
          success: true,
          errorMessage: null,
        },
        manager,
      );
      const afterSnapshot = this.buildProductSnapshot(product);
      const auditRepository = manager.getRepository(VendorProductAudit);

      await auditRepository.save(
        auditRepository.create({
          productId: product.id!,
          productReferenceId: product.id!,
          vendorId: vendor.vendorId,
          vendorLogId: vendorLog.id!,
          branchId: body.branchId,
          branchReferenceId: body.branchId,
          vendorCode: vendor.code,
          sku: body.sku.trim(),
          action: "created",
          changedFields: this.buildChangedFields(null, afterSnapshot),
          beforeSnapshot: null,
          afterSnapshot,
          requestPayload: { ...body },
        }),
      );

      return product;
    });
  }

  async updateVendorProductWithAudit(
    vendor: IVendorTokenPayload,
    sku: string,
    body: UpdateVendorProductDto,
  ): Promise<IProduct> {
    return this.dataSource.transaction(async (manager) => {
      const { product, previous } =
        await this.productService.updateImportedVendorProductBySkuWithPrevious(
          sku,
          body,
          manager,
        );
      const responsePayload = {
        productId: product.id,
        sku,
        branchId: body.branchId,
        action: "updated",
      };
      const vendorLog = await this.createLog(
        {
          vendorId: vendor.vendorId,
          type: "product_update",
          endpoint: `/v1/integrations/vendor/products/${sku}`,
          method: "PATCH",
          requestPayload: body,
          responsePayload,
          statusCode: 200,
          success: true,
          errorMessage: null,
        },
        manager,
      );
      const beforeSnapshot = this.buildProductSnapshot(previous);
      const afterSnapshot = this.buildProductSnapshot(product);
      const auditRepository = manager.getRepository(VendorProductAudit);

      await auditRepository.save(
        auditRepository.create({
          productId: product.id!,
          productReferenceId: product.id!,
          vendorId: vendor.vendorId,
          vendorLogId: vendorLog.id!,
          branchId: body.branchId,
          branchReferenceId: body.branchId,
          vendorCode: vendor.code,
          sku: sku.trim(),
          action: "updated",
          changedFields: this.buildChangedFields(
            beforeSnapshot,
            afterSnapshot,
          ),
          beforeSnapshot,
          afterSnapshot,
          requestPayload: { ...body },
        }),
      );

      return product;
    });
  }

  async listProductHistory(productId: number, page: number, limit: number) {
    const [data, total] = await this.vendorProductAuditRepository.findAndCount({
      where: { productReferenceId: productId },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: "DESC" },
    });

    return {
      data,
      pagination: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    };
  }

  async listLogs(vendorId: number, page: number, limit: number) {
    const vendor = await this.vendorRepository.findOne({
      where: { id: vendorId },
    });

    if (!vendor) {
      throw new NotFoundException("Vendor not found");
    }

    const [data, total] = await this.vendorLogRepository.findAndCount({
      where: { vendorId },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: "DESC" },
    });

    return {
      data,
      pagination: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    };
  }
}
