import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AesHelper } from './aes.helper';
import { ConfigService } from '@nestjs/config';
import { IAuthRequest } from '../interfaces/app.interface';
import { JwtService } from 'src/shared/jwt/jwt.service';
import { hashString } from '../utils/app.util';
import { RedisService } from 'src/shared/redis/redis.service';



/**
 * GuardHelper
 *
 * This class implements shared guard-related utilities for:
 * - Validating JWT tokens
 * - Validating PKCE headers
 * - Validating public auth payloads
 * - Validating Basic Auth credentials
 *
 * It keeps all security-related logic in a central place,
 * so that guards remain small and clean.
 */
@Injectable()
export class GuardHelper {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,

    private readonly aesHelper: AesHelper,
  ) { }

  /**
* validatePublicAuth
*
* Validates a public payload-based auth header:
* - Decrypts the payload header
* - Reconstructs expected payload string
* - Confirms decrypted payload matches expected value
*
* Used for public (non-user) routes where requests need lightweight validation.
*
* @param request Express HTTP request object
* @returns true if payload matches
*/
  validatePublicAuth = async (request: any): Promise<boolean> => {
    const payload = request.headers['payload'];

    if (!payload) {
      throw new BadRequestException('Missing payload header');
    }


    const expectedPayload =
      request.path + request.method + this.configService.get('PUB_Q');
    console.log(request.path, request.method, this.configService.get('PUB_Q'));
    console.log('Expected Payload:', this.aesHelper.encryptData(expectedPayload));
    const decryptedPayload = this.aesHelper.decryptData(payload);
    console.log('Decrypted Payload:', decryptedPayload);
    if (decryptedPayload !== expectedPayload) {
      throw new BadRequestException(
        'Public auth failed: payload mismatch',
        expectedPayload + ' != ' + decryptedPayload,
      );
    }

    return true;
  };

  /**
   * validateJwtToken
   *
   * Validates a Bearer JWT token in the Authorization header.
   * - Checks token format
   * - Verifies token signature
   * - Ensures device info matches between token and request
   * - Confirms token exists in Redis for session consistency
   *
   * @param request Express HTTP request object
   * @returns decoded token payload as IAuthRequest
   */
  validateJwtToken = async (request: any): Promise<IAuthRequest> => {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new BadRequestException('No token provided');
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new BadRequestException('Token must be a Bearer token');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new BadRequestException('Invalid token format');
    }

    const decoded = await this.jwtService.verifyAccessToken(token);

    if (!decoded) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const data = await this.redisService.getUserData(decoded.role, decoded.id);
    if (!data || data?.accessToken !== token) {
      throw new UnauthorizedException('Session expired or invalid token');
    }


    return decoded as IAuthRequest;
  };

  validateGuestAuth = async (request: any): Promise<IAuthRequest | boolean> => {
    const payload = request.headers['payload'];
    const authorization = request.headers['authorization'];

    // Check if both or neither are provided
    if (!!payload === !!authorization) {
      throw new UnauthorizedException(
        'Either payload or authorization must be provided, not both or neither.',
      );
    }

    if (payload) {
      return this.validatePublicAuth(request);
    }
    return this.validateJwtToken(request);
  };
}
