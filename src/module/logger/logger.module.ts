import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { pino } from 'pino';

@Module({
  imports: [
    PinoLoggerModule.forRoot({
      // @ts-ignore
      pinoHttp: {
        // https://github.com/pinojs/pino-http#pinohttpopts-stream
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
        transport: {
          targets: [
            {
              target:
                process.env.NODE_ENV !== 'production'
                  ? 'pino-pretty'
                  : 'pino/file',
              level: 'trace',
              options: {
                colorize: true,
                translateTime: true,
                singleLine: true,
              },
            },
            process.env.NODE_ENV === 'production'
              ? {
                  target: 'pino-sentry-transport',
                  options: {
                    sentry: {
                      dsn: process.env.SENTRY_DSN,
                      // additional options for Sentry
                    },
                    withLogRecord: true, // default false - send the log record to sentry as a context.(if its more then 8Kb Sentry will throw an error)
                    minLevel: 40, // which level to send to sentry
                  },
                  level: 'error',
                }
              : undefined,
          ].filter(Boolean),
        },
        serializers: {
          err: pino.stdSerializers.err,
        },
      },
    }),
  ],
})
export class LoggerModule {}
