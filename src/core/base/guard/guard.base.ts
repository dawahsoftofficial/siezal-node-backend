import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export abstract class BaseGuard implements CanActivate {
  constructor(protected reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    if (this.noGuard(context)) {
      return true;
    }

    return this.handleRequest(context);
  }

  guardExists(context: ExecutionContext): boolean {
    // If route has its own @UseGuards()
    const existingGuards = this.reflector.getAllAndOverride('__guards__', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (existingGuards?.length > 0) return true;
    return false;
  }

  noGuard(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      'isNoGuard',
      [context.getHandler(), context.getClass()], // Checks both levels
    );
    return isPublic;
  }

  abstract handleRequest(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean>;
}
