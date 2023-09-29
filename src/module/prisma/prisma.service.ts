import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  INestApplication,
  Logger,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
// import Redis from 'ioredis';
// import { createPrismaRedisCache } from 'prisma-redis-middleware';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log:
        process.env.NODE_ENV !== 'production'
          ? [{ emit: 'event', level: 'query' }]
          : undefined,
    }); // options
  }

  async onModuleInit() {
    this.logger.debug('Connecting to Prisma...');
    await this.$connect();
    this.logger.debug('Connected to Prisma!');

    // @ts-ignore
    this.$on('query', async (e: any) => {
      let queryString = e.query;
      JSON.parse(e.params).forEach((param, index) => {
        queryString = queryString.replace(
          `$${index + 1}`,
          typeof param === 'string' ? `'${param}'` : param,
        );
      });

      this.logger.debug(queryString);
    });

    this.useSoftDeleteQuery();
    this.useIgnoreUniqueConstraintViolation();
    // this.useCache();
  }

  // private async useCache() {
  //   // https://github.com/Asjas/prisma-redis-middleware

  //   const redis = new Redis(process.env.REDIS_URL);

  //   const cacheMiddleware: Prisma.Middleware = createPrismaRedisCache({
  //     models: [
  //       { model: 'Character' },
  //       { model: 'HistoryCharacter' },
  //       { model: 'Link' },
  //       { model: 'HistoryLink' },
  //       { model: 'Linklist' },
  //       { model: 'HistoryLinklist' },
  //       { model: 'Note' },
  //       { model: 'HistoryNote' },
  //       { model: 'MintedNote' },
  //       { model: 'HistoryMintedNote' },
  //       { model: 'Feed' },
  //       { model: 'Metadata' },
  //       { model: 'Achievement' },
  //       { model: 'AchievementStat' },
  //     ],
  //     storage: {
  //       type: 'redis',
  //       options: {
  //         client: redis,
  //         invalidation: {
  //           referencesTTL: 10 * 60, // seconds
  //         },
  //       },
  //     },
  //     cacheTime: 10 * 60,
  //     onHit: (key) => {
  //       this.logger.debug(`Cache hit: ${key}`);
  //     },
  //     onMiss: (key) => {
  //       this.logger.debug(`Cache miss: ${key}`);
  //     },
  //     onError: (key) => {
  //       this.logger.error('Cache error:', key);
  //     },
  //   });

  //   this.$use(cacheMiddleware);
  // }

  private async useSoftDeleteQuery() {
    // https://www.prisma.io/docs/concepts/components/prisma-client/middleware/soft-delete-middleware#step-3-optionally-prevent-readupdate-of-soft-deleted-records
    this.$use(async (params, next) => {
      // TODO: should add createdAt/updatedAt/deletedAt to every model
      if (params.model === 'EmailUser') {
        if (
          params.action.startsWith('find') &&
          params.action !== 'findUnique'
        ) {
          params.args.where ??= {};
          params.args.where.deletedAt =
            params.args.where.deletedAt === undefined
              ? null
              : params.args.where.deletedAt;
        }
      }
      return next(params);
    });
  }

  private async useIgnoreUniqueConstraintViolation() {
    this.$use(async (params, next) => {
      try {
        return await next(params);
      } catch (e) {
        this.handleErrorOfUniqueConstraintViolation(e);
      }
    });
  }

  handleErrorOfUniqueConstraintViolation(
    error: unknown,
    { throwOtherwise = true }: { throwOtherwise?: boolean } = {},
  ) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      const { target } = error.meta ?? {};
      this.logger.warn(`${error.message} (target: ${target};)`);
    } else if (throwOtherwise) {
      // otherwise, just throw the error
      throw error;
    }
  }

  handleErrorOfRecordNotFound(
    error: unknown,
    { throwOtherwise = true }: { throwOtherwise?: boolean } = {},
  ) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      const { cause } = error.meta ?? {};
      this.logger.warn(`${error.message} (cause: ${cause};)`);
    } else if (throwOtherwise) {
      // otherwise, just throw the error
      throw error;
    }
  }

  async onModuleDestroy() {
    this.logger.debug('Disconnecting from Prisma...');
    await this.$disconnect();
    this.logger.debug('Disconnected from Prisma!');
  }

  async enableShutdownHooks(app: INestApplication) {
    this.logger.debug('Enabling Prisma shutdown hooks...');
    this.$on('beforeExit', async () => {
      await app.close();
    });
    this.logger.debug('Enabled Prisma shutdown hooks!');
  }
}
