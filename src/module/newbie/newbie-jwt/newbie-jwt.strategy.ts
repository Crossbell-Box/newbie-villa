import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { JWT_SECRET, JWT_STRATEGY_NAME } from './newbie-jwt.constants';
import { PrismaService } from '@/module/prisma/prisma.service';
import { EmailUser } from '@prisma/client';
import { JwtPayload } from './newbie-jwt.type';

@Injectable()
export class NewbieJwtStrategy extends PassportStrategy(
  Strategy,
  JWT_STRATEGY_NAME,
) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET,
    });
  }

  async validate({ email }: JwtPayload): Promise<EmailUser | null> {
    if (!email) return null;
    const user = await this.prisma.emailUser.findUnique({ where: { email } });
    return user;
  }
}
