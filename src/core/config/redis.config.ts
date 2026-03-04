/**
 * Redis configuration for NestJS cache manager using Keyv.
 * Provides async cache configs for different use cases (API Gateway, Main, etc.).
 * Includes connection setup, error handling, and logging.
 *
 * Usage:
 *   import { mainyCacheConfig, secondaryCacheConfig } from './core/config/redis.config';
 *   CacheModule.registerAsync(mainyCacheConfig)
 */
import { createKeyv } from '@keyv/redis';
import { CacheModuleAsyncOptions } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { Logger, ServiceUnavailableException } from '@nestjs/common';

const logger = new Logger('RedisCache');

const isStrictRedisEnvironment = (configService: ConfigService) => {
  const nodeEnv = configService.get<string>('NODE_ENV')?.toLowerCase();

  return nodeEnv === 'prod' || nodeEnv === 'staging';
};

/**
 * Helper to build a Keyv Redis store with custom options and logging.
 * @param configService NestJS ConfigService for env/config access
 * @param db Redis database number
 * @param namespace Optional namespace for key prefixing
 */
const buildKeyv = (
  configService: ConfigService,
  db: number,
  namespace?: string,
) => {
  const shouldThrowOnConnectError = isStrictRedisEnvironment(configService);
  const redisOptions = {
    socket: {
      host: configService.get<string>('REDIS_HOST'),
      port: parseInt(configService.get<string>('REDIS_PORT')!, 10),
      reconnectStrategy: (retries: number) =>
        retries > 5 ? 10000 : Math.min(retries * 100, 3000),
    },
    database: db,
    disableOfflineQueue: true,
  };

  const keyv = createKeyv(redisOptions, {
    namespace,
    keyPrefixSeparator: ':',
  });

  logger.verbose(
    `Connecting to Redis... [DB=${db}${namespace ? `, NS=${namespace}` : ''}]`,
  );

  keyv.on('error', (err) => {
    if (
      err.code === 'ECONNREFUSED' ||
      err.message.includes('Socket closed unexpectedly')
    ) {
      logger.warn(`Redis connection refused. Retrying...`);
      if (!shouldThrowOnConnectError) {
        return;
      }
    }

    if (shouldThrowOnConnectError) {
      throw new ServiceUnavailableException(err);
    }
  });

  keyv.store.client.on('connect', () => {
    logger.log(
      `Redis client connected [DB=${db}${namespace ? `, NS=${namespace}` : ''}]`,
    );
  });

  void keyv.set('test', 'test', 10000).catch((err) => {
    if (shouldThrowOnConnectError) {
      throw new ServiceUnavailableException(err);
    }

    logger.warn('Redis is unavailable. Continuing without cache connectivity.');
  });

  return keyv;
};

/**
 * Async cache config for API Gateway, with namespacing by environment.
 * Usage: CacheModule.registerAsync(mainCacheConfig)
 */
export const mainCacheConfig: CacheModuleAsyncOptions = {
  useFactory: async (configService: ConfigService) => ({
    stores: [
      buildKeyv(
        configService,
        parseInt(configService.getOrThrow<string>('REDIS_DB')!),
        
          configService.getOrThrow<string>('NODE_ENV').toUpperCase(),
      ),
    ],
  }),
  inject: [ConfigService],
};
