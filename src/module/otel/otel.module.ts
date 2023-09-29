import { Module } from '@nestjs/common';
import { OpenTelemetryModule } from 'nestjs-otel';
import { OtelController } from './otel.controller';
import { PrismaService } from '@/module/prisma/prisma.service';

@Module({
  controllers: [OtelController],
  imports: [
    OpenTelemetryModule.forRoot({
      metrics: {
        hostMetrics: true, // Includes Host Metrics
        apiMetrics: {
          enable: true, // Includes api metrics
          // defaultAttributes: {
          //   // You can set default labels for api metrics
          //   custom: 'label',
          // },
          ignoreRoutes: ['/favicon.ico'], // You can ignore specific routes (See https://docs.nestjs.com/middleware#excluding-routes for options)
          ignoreUndefinedRoutes: false, //Records metrics for all URLs, even undefined ones
        },
      },
    }),
  ],
  providers: [PrismaService],
})
export class OtelModule {}
