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
import { FindOptionsWhere, Like, Repository } from "typeorm";
import { CreateVendorDto, UpdateVendorDto } from "./dto/create-vendor.dto";
import { IVendor } from "./interface/vendor.interface";
import { IVendorLog } from "./interface/vendor-log.interface";
import { generateRandomString, hashString } from "src/common/utils/app.util";
import { VendorLoginDto } from "./dto/vendor-login.dto";
import { IVendorTokenPayload } from "./interface/vendor-auth.interface";

@Injectable()
export class VendorService extends BaseSqlService<Vendor, IVendor> {
  constructor(
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
    @InjectRepository(VendorLog)
    private readonly vendorLogRepository: Repository<VendorLog>,
    private readonly jwtService: NestJwtService,
    private readonly configService: ConfigService,
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

  async createLog(payload: Omit<IVendorLog, "id" | "createdAt" | "updatedAt">) {
    return this.vendorLogRepository.save(
      this.vendorLogRepository.create(payload),
    );
  }

  async listLogs(vendorId: number, page: number, limit: number) {
    const vendor = await this.vendorRepository.findOne({ where: { id: vendorId } });

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
