import { Injectable } from '@nestjs/common';
import { readFile } from 'fs/promises';
import { resolve } from 'path';
import {
  ISendMailOptions,
  MailerService as MailerService_,
} from '@nestjs-modules/mailer';
import { InjectRedis } from '@songkeys/nestjs-redis';
import Redis from 'ioredis';
import { ThrottlerException } from '@nestjs/throttler';

@Injectable()
export class MailerService {
  private readonly TEMPLATE_PATH = resolve(__dirname, 'templates');
  private templates: Record<string, string> = {}; // cache templates

  private readonly MAILER_FROM = `Crossbell <${process.env.MAILER_USER}>`;

  readonly AVAILABLE_TEMPLATES = ['signup', 'reset-password'] as const;

  constructor(
    private readonly mailer: MailerService_,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async sendSignupEmail(email: string, code: string) {
    const template = await this.getTemplate('signup');
    const html = template
      .replace(/{{code}}/g, code)
      .replace(/{{email}}/g, email.split('@')[0]);
    return this.sendMail({
      to: email,
      subject: '🛎 Welcome to Crossbell - Verify your email',
      html,
    });
  }

  async sendResetPasswordEmail(email: string, code: string) {
    const template = await this.getTemplate('reset-password');
    const html = template
      .replace(/{{code}}/g, code)
      .replace(/{{email}}/g, email.split('@')[0]);
    return this.sendMail({
      to: email,
      subject: '🛎 Crossbell - Reset your password',
      html,
    });
  }

  private async getTemplate(
    name: (typeof this)['AVAILABLE_TEMPLATES'][number],
  ) {
    if (this.templates[name]) {
      return this.templates[name];
    }

    const template = await readFile(
      resolve(this.TEMPLATE_PATH, name, `prod.html`),
      'utf-8',
    );

    this.templates[name] = template;

    return template;
  }

  private async sendMail(options: ISendMailOptions) {
    // throttle checker
    let to = options.to ?? [];
    if (!Array.isArray(to)) {
      to = [to];
    }
    const toAddresses = to.map<string>((addr) => {
      if (typeof addr === 'string') {
        return addr;
      } else {
        return addr.address;
      }
    });

    const throttled = await Promise.all(
      toAddresses.map((addr) => this.isMailThrottled(addr)),
    );

    if (throttled.some((throttled) => throttled)) {
      throw new ThrottlerException("You're sending too many emails");
    }

    return this.mailer.sendMail({ from: this.MAILER_FROM, ...options });
  }

  private async isMailThrottled(
    address: string,
    seconds: number = 60,
    limit: number = 2,
  ): Promise<boolean> {
    const cacheKey = `mail:throttle:${address}:${this.MAILER_FROM}`;
    const count = await this.redis.incr(cacheKey);
    if (count === 1) {
      await this.redis.expire(cacheKey, seconds);
    }

    return count > limit;
  }
}
