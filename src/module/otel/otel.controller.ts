import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { PrismaService } from '@/module/prisma/prisma.service';
// import { Client } from 'undici';

@Controller({
  path: 'otel',
  version: VERSION_NEUTRAL,
})
@ApiExcludeController()
export class OtelController {
  constructor(private readonly prisma: PrismaService) {}

  // private readonly metricsClient = new Client('http://localhost:3001');

  @Get('/metrics')
  async getMetrics() {
    const metrics1 = await this.prisma.$metrics.prometheus({
      globalLabels: { server: 'crossbell_newbie_villa', app_version: 'v1' },
    });

    // const metrics2 = await this.metricsClient
    //   .request({
    //     method: 'GET',
    //     path: '/metrics',
    //   })
    //   .then((res) => res.body.text());

    // const metrics = metrics1 + metrics2;

    return metrics1;
  }
}
