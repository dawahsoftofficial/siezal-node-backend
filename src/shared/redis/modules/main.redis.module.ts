import { Module } from '@nestjs/common';
import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager';
import { mainCacheConfig } from 'src/core/config/redis.config';
import { ERedisConnectionName } from 'src/common/enums/app.enum';

@Module({
  imports: [
    CacheModule.registerAsync({
      ...mainCacheConfig,
    }),
  ],
  providers: [
    {
      provide: ERedisConnectionName.MAIN,
      useExisting: CACHE_MANAGER,
    },
  ],
  exports: [ERedisConnectionName.MAIN],
})
export class MainRedisModule {}
