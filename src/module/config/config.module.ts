import { Module } from '@nestjs/common';
import { ConfigModule as ConfigModule_ } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule_.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
  ],
})
export class ConfigModule {}
