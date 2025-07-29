import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { UserService } from "../user/user.service";
import { ERole } from "src/common/enums/role.enum";
import { removeSensitiveData, verifyPassword } from "src/common/utils/app.util";
import { JwtService } from "src/shared/jwt/jwt.service";
// import { User } from "src/database/entities/user.entity";
import { AesHelper } from "src/common/helpers/aes.helper";
import { IUser } from "../user/interface/user.interface";
import { RedisService } from "src/shared/redis/redis.service";


@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService, // Assuming RedisService is defined and imported correctly
    private readonly aesHelper: AesHelper, // Assuming AesHelper is defined and imported correctly
  ) { }
  login = async (
    email: string,
    password: string
  ): Promise<IUser & {
    token: {
      accessToken: string;
      refreshToken: string;
    };
  }> => {
    this.logger.log(`Login attempt for email: ${email}`);
    // Here you would typically validate the user credentials and return a token
    const user = await this.userService.findByEmail(email, ERole.ADMIN);

    if (!user || !(await verifyPassword(password, user.password!))) {
      this.logger.warn(`Invalid login attempt for email: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }
    this.logger.log(`User logged in successfully: ${user.email}`);
    const { accessToken, encryptRefreshToken } =
      await this.generateUserJwtTokens(user);

    const refreshToken = encryptRefreshToken
    await Promise.all([
      this.redisService.setUserData({ ...user, accessToken }), // Store user data in Redis with TTL
      await this.userService.updateById(user.id!, {
        refreshToken
      })
    ]);
    const userData = removeSensitiveData(user) as IUser;
    return {
      ...userData, token: {
        accessToken,
        refreshToken
      }
    };
  }

  private generateUserJwtTokens = async (
    user: IUser,
  ): Promise<{
    accessToken: string;
    encryptRefreshToken: string;
  }> => {
    // ✅ Generate Tokens
    const accessToken = this.jwtService.generateAccessToken(user);
    const refreshToken = this.jwtService.generateRefreshToken(user);

    const encryptRefreshToken = this.aesHelper.encryptData(refreshToken);

    return { accessToken, encryptRefreshToken };
  };

}