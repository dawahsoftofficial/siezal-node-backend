import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { MainRedisModule } from './modules/main.redis.module';


@Global()
@Module({
  imports: [
    MainRedisModule,
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
