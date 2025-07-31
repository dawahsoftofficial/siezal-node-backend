import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GuardHelper } from '../helpers/guard.helper';
import { Reflector } from '@nestjs/core';
import { BaseGuard } from 'src/core/base/guard/guard.base';
import { IAuthRequest } from '../interfaces/app.interface';

@Injectable()
export class GuestAuthGuard extends BaseGuard {
  constructor(
    reflector: Reflector,
    private readonly guardHelper: GuardHelper,
  ) {
    super(reflector);
  }

  /**
   * handleRequest
   *
   * Determines guest authentication strategy:
   * - If JWT → validates and attaches user info
   * - If PKCE → validates PKCE headers
   *
   * @param context ExecutionContext
   * @returns true if request is allowed
   */
  async handleRequest(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Validate either JWT or PKCE depending on guest headers
    const decodedOrResult = await this.guardHelper.validateGuestAuth(request);

    if (decodedOrResult && typeof decodedOrResult === 'object') {
      // JWT was used → attach user payload
      request.user = decodedOrResult as IAuthRequest;
      return true;
    }

    // PKCE was used → returned true means success
    if (decodedOrResult === true) {
      return true;
    }

    throw new UnauthorizedException('Guest authentication failed.');
  }
}
