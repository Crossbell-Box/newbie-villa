import { Module } from '@nestjs/common';
import { ThrottlerModule, minutes } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';

// TODO: https://github.com/nestjs/throttler#proxies
@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: minutes(1),
          limit: 1000,
        },
      ],
      storage: new ThrottlerStorageRedisService(process.env.REDIS_URL),
    }),
  ],
})
export class ThrottleModule {}
