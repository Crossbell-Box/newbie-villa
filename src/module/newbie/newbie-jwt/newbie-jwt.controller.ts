import { EmailUserEntity } from '@/module/http/generated';
import { WebException } from '@/utils/exception';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { EmailUser } from '@prisma/client';
import { CurrentUser } from './newbie-jwt.decorator';
import {
  EmailSignInBody,
  EmailSignUpBody,
  ResetPasswordBody,
  SignupVerifyEmailBody,
  SuccessResponse,
  TokenResponse,
  VerifyEmailVerifyCodeBody,
  CharacterIdParam,
} from './newbie-jwt.dto';
import { NewbieJwtAuthGuard } from './newbie-jwt.guard';
import { NewbieJwtService } from './newbie-jwt.service';
import { Throttle, minutes } from '@nestjs/throttler';

@Controller({
  path: '/',
  version: '1',
})
@ApiTags('Newbie')
export class NewbieJwtController {
  constructor(private jwtService: NewbieJwtService) {}

  @Throttle({ default: { ttl: minutes(1), limit: 2 } })
  @Post('/account/signup/email')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary:
      'Ask for a verify-code to be sent to an email box for registration',
  })
  async signupVerifyEmail(
    @Body() body: SignupVerifyEmailBody,
  ): Promise<SuccessResponse> {
    const { email } = body;
    const ok = await this.jwtService.signupVerifyEmail(email);

    return { ok };
  }

  @Post('/account/signup/email/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Check if the verify-code is valid for email registration',
  })
  async signupVerifyEmailVerifyCode(
    @Body() body: VerifyEmailVerifyCodeBody,
  ): Promise<SuccessResponse> {
    const { email, code } = body;
    const ok = await this.jwtService.checkEmailCode(email, code);

    return { ok };
  }

  @Throttle({ default: { ttl: minutes(10), limit: 1 } })
  @Put('/account/signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new email user' })
  async signup(@Body() body: EmailSignUpBody): Promise<TokenResponse> {
    const { email, password, emailVerifyCode, characterName } = body;
    const token = await this.jwtService.signup(
      email,
      password,
      emailVerifyCode,
      characterName,
    );

    return { token };
  }

  @Throttle({ default: { ttl: minutes(5), limit: 5 } })
  @Post('/account/signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in as an email user' })
  async signin(@Body() body: EmailSignInBody): Promise<TokenResponse> {
    const { email, password } = body;
    const token = await this.jwtService.signin(email, password);

    return { token };
  }

  @Throttle({ default: { ttl: minutes(1), limit: 2 } })
  @Post('/account/reset-password/email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Ask for a verify-code to be sent to an email box for password reset',
  })
  async resetPasswordVerifyEmail(
    @Body() body: SignupVerifyEmailBody,
  ): Promise<SuccessResponse> {
    const { email } = body;
    const ok = await this.jwtService.resetPasswordVerifyEmail(email);

    return { ok };
  }

  @Post('/account/reset-password/email/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Check if the verify-code is valid for password reset',
  })
  async resetPasswordVerifyEmailVerifyCode(
    @Body() body: VerifyEmailVerifyCodeBody,
  ): Promise<SuccessResponse> {
    const { email, code } = body;
    const ok = await this.jwtService.checkEmailCode(email, code);

    return { ok };
  }

  @Post('/account/reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password' })
  async resetPassword(
    @Body() body: ResetPasswordBody,
  ): Promise<SuccessResponse> {
    const { email, password, emailVerifyCode } = body;
    const ok = await this.jwtService.resetPassword(
      email,
      password,
      emailVerifyCode,
    );

    return { ok };
  }

  @Get('/account')
  @UseGuards(NewbieJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user information' })
  async me(@CurrentUser() user: EmailUser): Promise<EmailUserEntity> {
    if (user.passwordHash) {
      // @ts-ignore
      delete user.passwordHash;
    }

    return user;
  }

  @Delete('/account')
  @UseGuards(NewbieJwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete current user account' })
  async deleteAccount(@CurrentUser() user: EmailUser): Promise<void> {
    await this.jwtService.delete(user.email);
  }

  @Get('/characters/:characterId/newbie')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      "Get newbie email user's info by characterId; if not a newbie user, null will return",
  })
  async getNewbieInfo(
    @Param() param: CharacterIdParam,
  ): Promise<Partial<EmailUserEntity | null>> {
    const { characterId } = param;

    const info = await this.jwtService.getUserByCharacterId(characterId);

    return info;
  }

  /// special endpoint for mastodon
  /// @nyacandy
  @Put('/account/mastodon_signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiExcludeEndpoint()
  async mastodonSignup(
    @Body() body: { email: string; characterName: string; adminToken: string },
  ): Promise<TokenResponse> {
    const { email, characterName, adminToken } = body;
    // hard code admin token
    if (adminToken !== 'mAst0d0n!2O22@aDm1n') {
      throw new WebException("Admin token doesn't match", { status: 403 });
    }

    const token = await this.jwtService.mastodonSignup(email, characterName);

    return { token };
  }

  /// special endpoint for mastodon
  /// @nyacandy
  @Get('/account/mastodon_get_account')
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint()
  async mastodonGetAccount(
    @Query() param: { email: string; adminToken: string },
  ): Promise<EmailUserEntity | null> {
    const { email, adminToken } = param;

    // hard code admin token
    if (adminToken !== 'mAst0d0n!2O22@aDm1n') {
      throw new WebException("Admin token doesn't match", { status: 403 });
    }

    const user = await this.jwtService.getAccountByEmail(email);

    return user;
  }

  /// special endpoint for Wondera
  /// https://www.notion.so/rss3/Wondera-x-Crossbell-ecd8e58dbff14d9eb493fcfe8e0acdaa?d=92c471aabc5e4e8b96b2dc279dec28f3#7ab410d6dcb646dc8a408f36b1816434
  @Put('/account/wondera_signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiExcludeEndpoint()
  async wonderaSignup(
    @Body()
    body: {
      email: string;
      password: string;
      characterName: string;
      adminToken: string;
    },
  ): Promise<TokenResponse> {
    const { email, password, characterName, adminToken } = body;
    // hard code admin token
    if (adminToken !== 'wOnDeRa!2O23@aDm1n') {
      throw new WebException("Admin token doesn't match", { status: 403 });
    }

    const token = await this.jwtService.wonderaSignup(
      email,
      password,
      characterName,
    );

    return { token };
  }
}
