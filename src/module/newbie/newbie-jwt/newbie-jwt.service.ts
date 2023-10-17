import { CrossbellContractService } from '@/module/contract/contract.service';
import { PrismaService } from '@/module/prisma/prisma.service';
import { WebException } from '@/utils/exception';
import { InjectRedis } from '@songkeys/nestjs-redis';
import { MailerService } from '@/module/mailer/mailer.service';
import { CsbManagerService } from '@/module/csb-manager/csb-manager.service';
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import argon from 'argon2';
import Redis from 'ioredis';
import { NEWBIE_VILLA_WALLET_ADDRESS } from '../newbie.constants';
import { JwtPayload } from './newbie-jwt.type';
// @ts-ignore
import tr46 from 'tr46';

@Injectable()
export class NewbieJwtService {
  private readonly logger = new Logger(NewbieJwtService.name);

  private contract = this.contractService.createContractV1('newbie-villa');

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly contractService: CrossbellContractService,
    private readonly csbManagerService: CsbManagerService,
    private readonly mailerService: MailerService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  /** register a new email user */
  async signup(
    email: string,
    password: string,
    emailVerifyCode: string,
    characterName: string,
  ): Promise<string> {
    // check if email is already taken
    const has = await this.prisma.emailUser.findUnique({
      where: { email: email },
      select: { email: true },
    });
    if (has) {
      throw new WebException('Email already exists');
    }

    // check if email is verified
    await this.checkEmailCode(email, emailVerifyCode);

    // hash password
    const passwordHash = await argon.hash(password);

    // create a new character
    const randomHandle = this.generateHandleFromEmail(characterName);
    const createdCharacter = await this.contract.character.create({
      owner: NEWBIE_VILLA_WALLET_ADDRESS,
      handle: randomHandle,
      metadataOrUri: {
        name: characterName,
      },
    });

    // create a new user
    const user = await this.prisma.emailUser.create({
      data: {
        email: email,
        passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
        characterId: Number(createdCharacter.data),
        csb: this.csbManagerService.getDefaultCsb(),
      },
    });

    const token = await this.getToken(user.email);

    return token;
  }

  async signupVerifyEmail(email: string): Promise<boolean> {
    // check if email is already taken
    const has = await this.prisma.emailUser.findUnique({
      where: { email: email },
      select: { email: true },
    });
    if (has) {
      throw new WebException('Email already exists');
    }

    // generate a 6-digit code
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      await this.setEmailVerifyCode(email, code);
      await this.mailerService.sendSignupEmail(email, code);
    } catch (e) {
      this.logger.error(e);
      throw new WebException(
        'Failed to send email. Please check if email is valid, or contact support.',
      );
    }
    return true;
  }

  async resetPasswordVerifyEmail(email: string): Promise<boolean> {
    // check if email is already taken
    const has = await this.prisma.emailUser.findUnique({
      where: { email: email },
      select: { email: true },
    });
    if (!has) {
      throw new WebException('This email is not registered');
    }

    try {
      // generate a 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      await this.setEmailVerifyCode(email, code);
      await this.mailerService.sendResetPasswordEmail(email, code);
    } catch (e) {
      this.logger.error(e);
      throw new WebException(
        'Failed to send email. Please check if email is valid, or contact support.',
      );
    }
    return true;
  }

  async resetPassword(
    email: string,
    password: string,
    emailVerifyCode: string,
  ): Promise<true> {
    // check if email is verified
    await this.checkEmailCode(email, emailVerifyCode);

    // hash password
    const passwordHash = await argon.hash(password);

    // update password
    await this.prisma.emailUser.update({
      where: { email },
      data: { passwordHash, updatedAt: new Date() },
      select: { email: true },
    });

    return true;
  }

  async signin(email: string, password: string): Promise<string> {
    const user = await this.prisma.emailUser.findUnique({
      where: { email },
      select: {
        email: true,
        passwordHash: true,
        characterWithdrawnAt: true,
        deletedAt: true,
      },
    });

    if (!user) {
      throw new WebException('User not found');
    }

    if (user.deletedAt) {
      throw new WebException('User is deleted');
    }

    const passwordMatches = await argon.verify(user.passwordHash, password);
    if (!passwordMatches) {
      throw new WebException('Wrong password');
    }

    if (user.characterWithdrawnAt) {
      throw new WebException(
        'Sorry. You are not able to login because you have withdrawn your character.',
      );
    }

    const token = await this.getToken(user.email);

    return token;
  }

  async delete(email: string) {
    return await this.prisma.emailUser.update({
      where: { email },
      data: { deletedAt: new Date() },
    });
  }

  async findOne(email: string) {
    const user = await this.prisma.emailUser.findUnique({
      where: { email },
      select: {
        email: true,
        csb: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    });

    if (user?.deletedAt) {
      return null;
    }

    // @ts-ignore
    delete user?.deletedAt;

    return user;
  }

  async checkEmailCode(
    email: string,
    emailVerifyCode: string,
  ): Promise<boolean> {
    const code = await this.getEmailVerifyCode(email);
    if (!code) {
      throw new WebException('No code or code expired');
    }
    if (code !== emailVerifyCode) {
      throw new WebException('Wrong code');
    }

    return true;
  }

  async getUserByCharacterId(characterId: number) {
    const user = await this.prisma.emailUser.findUnique({
      where: { characterId },
      select: {
        email: true,
        csb: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    });

    if (user?.deletedAt) {
      return null;
    }

    // @ts-ignore
    delete user?.deletedAt;

    return user;
  }

  private async getToken(email: string): Promise<string> {
    const jwtPayload: JwtPayload = {
      email: email,
    };

    const token = await this.jwtService.signAsync(jwtPayload);

    return token;
  }

  private async setEmailVerifyCode(email: string, code: string) {
    // set 10 minutes expire
    await this.redis.setex(`email-verify-code:${email}`, 600, code);
  }

  private async getEmailVerifyCode(email: string): Promise<string | null> {
    const code = await this.redis.get(`email-verify-code:${email}`);
    return code;
  }

  private generateHandleFromEmail(name: string) {
    name = tr46.toASCII(name);
    const randomNumber = Math.floor(Math.random() * 10000);
    return (
      name
        .trim()
        .split('@')[0]
        .slice(0, 25)
        .toLowerCase()
        .replace(/\s/g, '-')
        .replace(/[^a-z0-9-]/g, '') +
      '-' +
      randomNumber
    );
  }

  ///

  async mastodonSignup(email: string, characterName: string): Promise<string> {
    if (!email) {
      throw new WebException('email is require');
    }
    if (!characterName) {
      throw new WebException('characterName is required');
    }

    // check if email is already taken
    const has = await this.prisma.emailUser.findUnique({
      where: { email: email },
      select: { email: true },
    });
    if (has) {
      throw new WebException('Email already exists');
    }

    // generate a random password
    const password = Math.random().toString(36).slice(-8);

    // hash password
    const passwordHash = await argon.hash(password);

    // create a new character
    const randomHandle = this.generateHandleFromEmail(characterName);
    const createdCharacter = await this.contract.character.create({
      owner: NEWBIE_VILLA_WALLET_ADDRESS,
      handle: randomHandle,
      metadataOrUri: {
        name: characterName,
      },
    });

    // create a new user
    const user = await this.prisma.emailUser.create({
      data: {
        email: email,
        passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
        characterId: Number(createdCharacter.data),
        csb: this.csbManagerService.getDefaultCsb(),
      },
    });

    const token = await this.getToken(user.email);

    return token;
  }

  async wonderaSignup(
    email: string,
    password: string,
    characterName: string,
  ): Promise<string> {
    if (!email) {
      throw new WebException('email is require');
    }
    if (!password) {
      throw new WebException('password is require');
    }
    if (!characterName) {
      throw new WebException('characterName is required');
    }

    // check if email is already taken
    const has = await this.prisma.emailUser.findUnique({
      where: { email: email },
      select: { email: true },
    });
    if (has) {
      throw new WebException('Email already exists');
    }

    // hash password
    const passwordHash = await argon.hash(password);

    // create a new character
    const randomHandle = this.generateHandleFromEmail(characterName);
    const createdCharacter = await this.contract.character.create({
      owner: NEWBIE_VILLA_WALLET_ADDRESS,
      handle: randomHandle,
      metadataOrUri: {
        name: characterName,
      },
    });

    // create a new user
    const user = await this.prisma.emailUser.create({
      data: {
        email: email,
        passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
        characterId: Number(createdCharacter.data),
        csb: this.csbManagerService.getDefaultCsb(),
      },
    });

    const token = await this.getToken(user.email);

    return token;
  }

  async getAccountByEmail(email: string) {
    return this.prisma.emailUser.findUnique({
      where: { email },
      select: {
        email: true,
        characterId: true,
        csb: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        characterWithdrawnAt: true,
        characterWithdrawnTo: true,
      },
    });
  }
}
