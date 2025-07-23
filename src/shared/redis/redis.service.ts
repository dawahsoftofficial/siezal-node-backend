import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { ERedisConnectionName } from 'src/common/enums/app.enum';
import { ERedisKey } from 'src/common/enums/redis-key.enum';
import { ERole } from 'src/common/enums/role.enum';
import { IUser } from 'src/module/user/interface/user.interface';



@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);

  constructor(
    @Inject(ERedisConnectionName.MAIN) private mainCache: Cache,
  ) {}
   /**
   * Set a value in Redis with optional TTL (in seconds)
   */
   async setUserData(value: IUser, ttl = 3600000): Promise<void> {
    const key = `${ERedisKey.USER_ACCESS}:${value.role}:${value.id}`;
    await this.mainCache.set(key, value, ttl);
  }

  /**
   * Get a value from Redis by key
   */
  async getUserData<T>(role:ERole,id:number): Promise<IUser | undefined> {
     const key = `${ERedisKey.USER_ACCESS}:${role}:${id}`;
    return this.mainCache.get<IUser>(key);
  }


}
