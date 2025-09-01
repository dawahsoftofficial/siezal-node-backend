import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { ClassConstructor, plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { Reflector } from "@nestjs/core";

import { GUARDS_METADATA } from "@nestjs/common/constants";
import { PublicAuthGuard } from "../guards/public-auth.guard";
import { formatValidationErrors } from "../utils/app.util";
import { NO_HEADERS_KEY } from "../contants/app.constant";
import { PublicRouteHeaderDto } from "../dto/public-route-header.dto";
import { AuthenticatedHeaderDto } from "../dto/auth-route-header.dto";
import { Logger } from "@nestjs/common";
import { GuestAuthGuard } from "../guards/guest-auth.guard";
import { GuestHeaderDto } from "../dto/guest-header.dto";

const COMMON_HEADERS = new Set([
  "accept",
  "accept-encoding",
  "accept-language",
  "cache-control",
  "connection",
  "content-length",
  "content-type",
  "cookie",
  "date",
  "host",
  "origin",
  "pragma",
  "referer",
  "sec-fetch-mode",
  "sec-fetch-site",
  "user-agent",
  "x-forwarded-for",
  "x-real-ip",
  "x-request-id",
  "x-api-key",
  "dnt",
]);

const HEADER_TRANSFORMERS: Record<string, (value: any) => any> = {};

const EXCLUDE_URL = ["/health-check"];
@Injectable()
export class ValidatedHeadersInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ValidatedHeadersInterceptor.name);
  constructor(private readonly reflector: Reflector) {}

  private shouldExclude(url: string): boolean {
    return EXCLUDE_URL.some((excludePath) => url.includes(excludePath));
  }
  private getDtoClass(context: ExecutionContext): ClassConstructor<any> {
    const ApplyHeader = this.reflector.getAllAndOverride<ClassConstructor<any>>(
      NO_HEADERS_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (ApplyHeader) return ApplyHeader;

    const guards = this.reflector.getAllAndOverride<any[]>(GUARDS_METADATA, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (this.isPublicGuard(guards)) {
      return PublicRouteHeaderDto;
    }

    if (this.isGuestGuard(guards)) {
      return GuestHeaderDto;
    }

    return AuthenticatedHeaderDto;
  }

  private isPublicGuard(guards: any[]) {
    return guards?.some((guard) => guard === PublicAuthGuard);
  }

  private isGuestGuard(guards: any[]) {
    return guards?.some((guard) => guard === GuestAuthGuard);
  }
  private normalizeHeaders(rawHeaders: Record<string, any>) {
    return Object.entries(rawHeaders).reduce((acc, [key, value]) => {
      const lowerKey = key.toLowerCase();
      const transformer = HEADER_TRANSFORMERS[lowerKey];

      acc[lowerKey] = transformer ? transformer(value) : value;
      return acc;
    }, {});
  }

  private validateHeaders(dto: any, url: string) {
    const errors = validateSync(dto, {
      whitelist: true,
      forbidNonWhitelisted: false,
      stopAtFirstError: false,
    });

    if (errors.length > 0 && !this.shouldExclude(url)) {
      const error = formatValidationErrors(errors);
      this.logger.error(`Header validation failed for URL: ${url}`, error);

      throw new BadRequestException({
        success: false,
        message: "Validation failed",
        errors: error,
      });
    }
  }

  private checkUnknownHeaders(
    normalizedHeaders: Record<string, any>,
    dto: any,
    url: string
  ) {
    const allowedKeys = new Set([
      ...Object.keys(dto).map((k) => k.toLowerCase()),
      ...COMMON_HEADERS,
    ]);

    const unknownCustomHeaders = Object.keys(normalizedHeaders).filter(
      (key) => !allowedKeys.has(key)
    );

    if (unknownCustomHeaders.length > 0 && !this.shouldExclude(url)) {
      throw new BadRequestException(
        `Unexpected headers: ${unknownCustomHeaders.join(", ")}`
      );
    }
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const url = request.url;
    const dtoClass = this.getDtoClass(context);
    const normalizedHeaders = this.normalizeHeaders(request.headers);

    if (!dtoClass) {
      throw new Error(
        "No DTO class could be resolved in ValidatedHeadersInterceptor"
      );
    }
    const dto = plainToInstance(dtoClass, normalizedHeaders);
    this.validateHeaders(dto, url);
    this.checkUnknownHeaders(normalizedHeaders, dto, url);

    request.validatedHeaders = dto;
    return next.handle();
  }
}
