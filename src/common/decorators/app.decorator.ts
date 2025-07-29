/**
 * Common custom decorators for authentication, header validation, and repository/entity injection.
 * These decorators help standardize controller and service patterns across the app.
 */
import { Inject, SetMetadata, Type, createParamDecorator, ExecutionContext, Controller } from '@nestjs/common';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import { InjectRepository } from '@nestjs/typeorm';
import { Entity, EntityOptions } from 'typeorm';
import { NO_HEADERS_KEY } from '../contants/app.constant';
import { IAuthRequest } from '../interfaces/app.interface';
import { ClassConstructor } from 'class-transformer';
import { EDBConnectionName } from '../enums/app.enum';
import { BaseHeaderDto } from 'src/core/base/dto/dto-header.base';

/**
 * Decorator to mark a route as not requiring authentication guard.
 * Usage: @NoGuard()
 */
export const NoGuard = () => SetMetadata('isNoGuard', true);

/**
 * Decorator to apply header validation DTO to a controller or route.
 * @param dto Optional - The DTO class to validate headers against (defaults to BaseHeaderDto)
 * @example
 * // Use default validation
 * @ApplyHeader()
 * // Use specific DTO
 * @ApplyHeader(JwtHeaderDto)
 */
export const ApplyHeader = (dto: ClassConstructor<any> = BaseHeaderDto) => {
  return SetMetadata(NO_HEADERS_KEY, dto);
};


/**
 * Parameter decorator to extract the authenticated user from the request.
 * Usage: @AuthUser() or @AuthUser('id')
 */
export const AuthUser = createParamDecorator(
  (data: keyof any, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: IAuthRequest = request.user;
    return data ? user?.[data] : user;
  },
);

/**
 * Parameter decorator to extract validated headers from the request.
 * Usage: @ValidatedHeaders() or @ValidatedHeaders('deviceinfo')
 */
export const ValidatedHeaders = createParamDecorator(
  (data: keyof any, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const headers: any = request.validatedHeaders;
    return data ? headers?.[data] : headers;
  },
);

/**
 * Custom decorator for admin controllers.
 * Automatically prefixes the route with `v1/admin/`.
 *
 * @param path - Optional path to append after the admin prefix.
 * @returns ClassDecorator - Standard NestJS Controller decorator.
 *
 * @example
 * @AdminController('users') // => @Controller('v1/admin/users')
 */
export function AdminRouteController(path: string = ''): ClassDecorator {
  return Controller(`v1/admin/${path}`);
}

/**
 * Custom decorator for user-facing controllers.
 * Automatically prefixes the route with `v1/user/`.
 *
 * @param path - Optional path to append after the user prefix.
 * @returns ClassDecorator - Standard NestJS Controller decorator.
 *
 * @example
 * @UserController('profile') // => @Controller('v1/user/profile')
 */
export function UserRouteController(path: string = ''): ClassDecorator {
  return Controller(`v1/user/${path}`);
}

/**
 * Custom decorator for public or shared controllers.
 * Automatically prefixes the route with `v1/`.
 *
 * @param path - Optional path to append after the base version.
 * @returns ClassDecorator - Standard NestJS Controller decorator.
 *
 * @example
 * @PublicController('auth') // => @Controller('v1/auth')
 */
export function PublicRouteController(path: string = ''): ClassDecorator {
  return Controller(`v1/${path}`);
}