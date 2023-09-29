import { OtelModule } from './otel/otel.module';
import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LoggerModule } from './logger/logger.module';
import { PrismaModule } from './prisma/prisma.module';
import { NewbieModule } from './newbie/newbie.module';
import { MailerModule } from './mailer/mailer.module';
import { ConfigModule } from './config/config.module';
import { RedisModule } from './redis/redis.module';
import { ThrottleModule } from './throttle/throttle.module';

@Module({
  imports: [
    OtelModule,
    ConfigModule,
    LoggerModule,
    PrismaModule,
    RedisModule,
    MailerModule,
    ThrottleModule,
    EventEmitterModule.forRoot(),
    NewbieModule,
  ],
})
export class AppModule {}
