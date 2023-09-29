import otelSDK from '@/module/otel/tracing';
import { AppModule } from '@/module/app.module';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { configure } from '@/config.main';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  if (process.env.NODE_ENV === 'production') {
    otelSDK.start();
  }

  const PORT = process.env.PORT || 3000;

  let app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      trustProxy: true,
      forceCloseConnections: true,
    }),
    { bufferLogs: true },
  );

  app = await configure(app);

  // start server
  await app.listen(PORT, '0.0.0.0'); // to accept connections on other hosts

  logger.log(
    `Crossbell Newbie Villa API is running on: http://localhost:${PORT}`,
  );

  logger.log(
    `Crossbell Newbie Villa API Docs is running on: http://localhost:${PORT}/docs`,
  );
}

// process.on('warning', (e) => console.warn(e.stack));

bootstrap();

process.on('SIGTERM', async () => {
  await otelSDK
    .shutdown()
    .then(
      () => logger.log('Tracing SDK shut down successfully'),
      (err) => {
        logger.error('Error shutting down Tracing SDK %o', err);
        console.error(err);
      },
    )
    .finally(() => process.exit(0));
});
