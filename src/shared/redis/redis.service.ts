import { Inject, Injectable, Logger } from "@nestjs/common";
import { Cache } from "cache-manager";
import { ERedisConnectionName } from "src/common/enums/app.enum";
import { ERedisKey } from "src/common/enums/redis-key.enum";
import { ERole } from "src/common/enums/role.enum";
import { IUser } from "src/module/user/interface/user.interface";

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);

  constructor(@Inject(ERedisConnectionName.MAIN) private mainCache: Cache) {}
  /**
   * Set a value in Redis with optional TTL (in seconds)
   */
  async setUserData(
    sessionId: string,
    value: IUser & { refreshToken?: string | null; accessToken?: string },

    ttl = 3600000
  ): Promise<void> {
    const key = `${ERedisKey.USER_ACCESS}:${value.role}:${value.id}:${sessionId}`;
    console.log(`Setting user data for key: ${key} with TTL: ${ttl}`, value);
    await this.mainCache.set(key, value, ttl);
  }

  async setResetPaswordToken(
    key: string,
    value: number,
    ttl = 1800 // 30 minutes
  ): Promise<void> {
    const redisKey = `${ERedisKey.RESET_PASSWORD}:${key}`;
    await this.mainCache.set(redisKey, value, ttl);
    this.logger.log(
      `Set reset password token for user ${key} with TTL ${ttl} seconds`
    );
  }

  async getUserIdResetPasswordToken(key: string): Promise<number | undefined> {
    const redisKey = `${ERedisKey.RESET_PASSWORD}:${key}`;
    const token = await this.mainCache.get<number>(redisKey);
    this.logger.log(`Get reset password token for user ${key}: ${token}`);
    return token;
  }
  /**
   * Get a value from Redis by key
   */
  async getUserData(
    sessionId: string,
    role: ERole,
    id: number
  ): Promise<
    (IUser & { refreshToken?: string | null; accessToken?: string }) | undefined
  > {
    const key = `${ERedisKey.USER_ACCESS}:${role}:${id}:${sessionId}`;
    return this.mainCache.get<
      IUser & { refreshToken?: string | null; accessToken?: string }
    >(key);
  }

  async deleteUserData(
    sessionId: string,
    role: ERole,
    id: number
  ): Promise<void> {
    const key = `${ERedisKey.USER_ACCESS}:${role}:${id}:${sessionId}`;
    this.logger.log(`Deleting user data for key: ${key}`);
    await this.mainCache.del(key);
  }
}
