import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import AltairFastify from 'altair-fastify-plugin';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { PrismaService } from '@/module/prisma/prisma.service';
import compression from '@fastify/compress';
import fastifySecureSession from '@fastify/secure-session';

export async function configure(
  app: NestFastifyApplication,
): Promise<NestFastifyApplication> {
  // logger
  const logger = app.get(Logger);
  app.useLogger(logger);
  logger.debug('loaded: Logger');

  app.useGlobalInterceptors(new LoggerErrorInterceptor());

  // dto validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  logger.debug('loaded: ValidationPipe');

  // versioning
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // swagger
  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Crossbell Newbie Villa Service API')
      .setVersion('1.0')
      .setContact('Crossbell', 'https://crossbell.io', 'contact@crossbell.io')
      .setExternalDoc('Discord community', 'https://discord.gg/4GCwDsruyj')
      .setTermsOfService('https://legal.xlog.app/Terms-of-Service')
      .addBearerAuth({ type: 'http', name: 'newbie' }, 'newbie')
      .build(),
  );

  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'Crossbell Newbie Villa Docs',
    customfavIcon: 'https://crossbell.io/favicon.ico',
  });

  logger.debug('loaded: SwaggerModule');

  // prisma
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);
  logger.debug('loaded: PrismaService');

  // cors
  app.enableCors({
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
    origin: true,
    credentials: true,
  });

  // graphql
  app.register(AltairFastify, {
    path: '/altair',
    baseURL: '/altair/',
    // 'endpointURL' should be the same as the mercurius 'path'
    endpointURL: '/v1/graphql',
    initialQuery: `{
  characters(where: { handle: { contains: "a" }}, take: 10) {
    handle
    characterId
    owner
  }
}`,
  });

  // @ts-expect-error session. see https://github.com/fastify/fastify-secure-session#using-a-secret
  app.register(fastifySecureSession, {
    secret: process.env.SESSION_SECRET,
    salt: process.env.SESSION_SALT,
    cookie: {
      // options for setCookie, see https://github.com/fastify/fastify-cookie
      path: '/',
      httpOnly: true, // Use httpOnly for all production purposes
      secure: process.env.NODE_ENV === 'production', // https only
      sameSite: 'none',
    },
  });

  // compression
  app.register(compression, { encodings: ['gzip', 'deflate'] });

  return app;
}
