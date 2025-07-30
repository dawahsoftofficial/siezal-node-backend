import {
    BadRequestException,
    ExecutionContext,
    Injectable,
  } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
  import { GuardHelper } from '../helpers/guard.helper';
import { BaseGuard } from 'src/core/base/guard/guard.base';
  
  @Injectable()
  export class PublicAuthGuard extends BaseGuard {
    constructor(
      private readonly guardHelper: GuardHelper,
      reflector: Reflector,
    ) {
      super(reflector);
    }
  
    handleRequest(context: ExecutionContext) {
      if (process.env.NODE_ENV === 'local') {
        return true;
      }
  
      const request = context.switchToHttp().getRequest();
      return this.guardHelper.validatePublicAuth(request);
    }
  }
  