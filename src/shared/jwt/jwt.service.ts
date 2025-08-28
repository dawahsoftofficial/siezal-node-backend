import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  JwtService as DefaultJwtService,
  TokenExpiredError,
} from '@nestjs/jwt';
import { ERole } from 'src/common/enums/role.enum';
import { IAuthRequest, IJwtResponse } from 'src/common/interfaces/app.interface';
import { IUser } from 'src/module/user/interface/user.interface';


@Injectable()
export class JwtService {
  private readonly logger = new Logger(JwtService.name);

  constructor(
    private readonly defaultJwtService: DefaultJwtService,
    private readonly configService: ConfigService,
  ) {}

  generateAccessToken(user: Partial<IUser>): string {
    const payload :IAuthRequest= {
      id: user.id!,
      email: user?.email,
          phone:user.phone!,
      role: user.role || ERole.USER,
    };
    const expiresIn = this.configService.getOrThrow(
      'JWT_ACCESS_SECRET_EXPIRES_IN',
    );
    return this.defaultJwtService.sign(
      { ...payload },
      {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
        expiresIn: expiresIn,
      },
    );
  }

  generateRefreshToken(user: Partial<IUser>): string {
    const payload :IAuthRequest= {
      id: user.id!,
      email: user?.email,
      phone:user.phone!,
      role: user.role || ERole.USER,
    };
    const expiresIn = this.configService.getOrThrow(
      'JWT_REFRESH_SECRET_EXPIRES_IN',
    );

    return this.defaultJwtService.sign(
      { ...payload },
      { secret: this.configService.get('JWT_REFRESH_SECRET'), expiresIn },
    );
  }

  async verifyRefreshTokenExpiry(refreshToken: string): Promise<{
    expiry: boolean;
    error?: boolean;
    user?: IAuthRequest;
  }> {
    try {
      const decoded = this.defaultJwtService.verify<IJwtResponse>(
        refreshToken,
        {
          secret: this.configService.get('JWT_REFRESH_SECRET'),
        },
      );

      const { iat, exp, ...rest } = decoded;
      return { expiry: false, error: false, user: rest }; // ✅ Token is valid
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        this.logger.warn('⚠️ Token Expired. Attempting to Decode...');
        return this.decodeExpiredToken(refreshToken);
      }
      return { expiry: false, error: true }; // ❌ Invalid token
    }
  }

  async verifyAccessToken(accessToken: string): Promise<null | IAuthRequest> {
    try {
      const decoded = this.defaultJwtService.verify<IJwtResponse>(accessToken, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
      });
      const { iat, exp, ...rest } = decoded;
      return rest;
    } catch (error) {
      return null;
    }
  }

  decodeToken(token: string): IJwtResponse | null {
    try {
      const decoded = this.defaultJwtService.decode(token);
      return decoded;
    } catch (error) {
      return null;
    }
  }

  private decodeExpiredToken(refreshToken: string): {
    expiry: boolean;
    error: boolean;
    user?: IAuthRequest;
  } {
    try {
      const decoded = this.decodeToken(refreshToken);
      if (!decoded) {
        return { expiry: true, error: true };
      }

      const { iat, exp, ...rest } = decoded;

      return { expiry: true, error: false, user: rest }; // ⚠️ Expired but user details are available
    } catch (decodeError) {
      return { expiry: true, error: true };
    }
  }

  async verifyRefreshToken(refreshToken: string): Promise<null | IAuthRequest> {
    try {
      const decoded = this.defaultJwtService.verify<IJwtResponse>(
        refreshToken,
        {
          secret: this.configService.get('JWT_REFRESH_SECRET'),
        },
      );
      const { iat, exp, ...rest } = decoded;
      return rest;
    } catch (error) {
      return null;
    }
  }

}
