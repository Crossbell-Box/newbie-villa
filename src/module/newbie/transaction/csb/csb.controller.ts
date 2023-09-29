import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiBearerAuthNewbie,
  CurrentUser,
} from '../../newbie-jwt/newbie-jwt.decorator';
import { EmailUser } from '@prisma/client';
import { NewbieJwtAuthGuard } from '../../newbie-jwt/newbie-jwt.guard';
import { GetCsbBalanceResponse } from './csb.dto';
import { NewbieCsbService } from './csb.service';

@Controller({
  path: '/',
  version: '1',
})
@ApiTags('Newbie')
@ApiBearerAuthNewbie()
@UseGuards(NewbieJwtAuthGuard)
export class NewbieCsbController {
  constructor(private readonly csbService: NewbieCsbService) {}

  @Get('/newbie/account/balance')
  @ApiOperation({ summary: 'Get the balance of csb' })
  async getCsbBalance(
    @CurrentUser() user: EmailUser,
  ): Promise<GetCsbBalanceResponse> {
    const res = await this.csbService.getCurrentCsb(user.characterId);

    return {
      balance: res,
    };
  }

  @Post('/newbie/account/balance/refill')
  @ApiOperation({ summary: 'Refill the balance of csb (once per day)' })
  async refillCsbBalance(
    @CurrentUser() user: EmailUser,
  ): Promise<GetCsbBalanceResponse> {
    const res = await this.csbService.refillCsb(user.characterId);

    return {
      balance: res,
    };
  }
}
