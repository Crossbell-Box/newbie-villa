import { Global, Module } from '@nestjs/common';
import { MailerModule as MailerModule_ } from '@nestjs-modules/mailer';
import { OAuth2Client } from 'google-auth-library';
import { Logger } from '@nestjs/common';
import { MailerService } from './mailer.service';

@Global()
@Module({
  imports: [
    MailerModule_.forRootAsync({
      useFactory: async () => {
        const logger = new Logger('MailerModule');

        // https://medium.com/@nickroach_50526/sending-emails-with-node-js-using-smtp-gmail-and-oauth2-316fe9c790a1

        const clientId = process.env.MAILER_GMAIL_CLIENT_ID;
        const clientSecret = process.env.MAILER_GMAIL_CLIENT_SECRET;
        const refreshToken = process.env.MAILER_GMAIL_REFRESH_TOKEN;

        if (!clientId || !clientSecret || !refreshToken) {
          logger.warn('Gmail OAuth2 not configured');
          return {
            transport: 'smtp://localhost:1025', // fake SMTP server
          };
        }

        const oauth2Client = new OAuth2Client(
          clientId,
          clientSecret,
          'https://developers.google.com/oauthplayground', // Redirect URL
        );
        oauth2Client.setCredentials({
          refresh_token: refreshToken,
          scope: 'https://mail.google.com/',
        });
        const { token } = await oauth2Client.getAccessToken();

        logger.log('Gmail OAuth2 configured');

        return {
          // https://nest-modules.github.io/mailer/docs/mailer.html
          transport: {
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
              type: 'OAuth2',
              user: process.env.MAILER_USER!,
              clientId: clientId!,
              clientSecret: clientSecret!,
              accessToken: token!,
              refreshToken: refreshToken!,
            },
            defaults: {
              from: `"Crossbell" <${process.env.MAILER_USER!}>`,
            },
            tls: { rejectUnauthorized: false },
          },
        };
      },
    }),
  ],
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule {}
