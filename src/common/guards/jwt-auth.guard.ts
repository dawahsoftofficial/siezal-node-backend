import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GuardHelper } from '../helpers/guard.helper';
import { BaseGuard } from 'src/core/base/guard/guard.base';

@Injectable()
export class JwtAuthGuard extends BaseGuard {
  constructor(
    private readonly guardHelper: GuardHelper,
    reflector: Reflector,
  ) {
    super(reflector);
  }
  handleRequest = async (context: ExecutionContext) => {
    const isGuardExist = this.guardExists(context);
    if (isGuardExist) return true; // ✅ Skip auth for public routes

    const request = context.switchToHttp().getRequest();
    const decoded = await this.guardHelper.validateJwtToken(request);
    request.user = decoded; // ✅ Attach decoded user to request
    return true;
  };
}
