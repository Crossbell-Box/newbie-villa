import { Module } from '@nestjs/common';
import { RedisModule as RedisModule_ } from '@songkeys/nestjs-redis';

// https://github.com/liaoliaots/nestjs-redis/blob/main/docs/latest/redis.md

@Module({
  imports: [
    RedisModule_.forRoot({
      config: {
        url: process.env.REDIS_URL,
      },
    }),
  ],
})
export class RedisModule {}
