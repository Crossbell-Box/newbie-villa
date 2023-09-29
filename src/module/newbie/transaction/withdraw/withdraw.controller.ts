import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiBearerAuthNewbie,
  CurrentUser,
} from '../../newbie-jwt/newbie-jwt.decorator';
import { EmailUser } from '@prisma/client';
import { NewbieJwtAuthGuard } from '../../newbie-jwt/newbie-jwt.guard';
import { NewbieWithdrawService } from './withdraw.service';
import { GetWithdrawProofsResponse } from './withdraw.dto';

@Controller({
  path: '/',
  version: '1',
})
@ApiTags('Newbie')
@ApiBearerAuthNewbie()
@UseGuards(NewbieJwtAuthGuard)
export class NewbieWithdrawController {
  constructor(private readonly withdrawService: NewbieWithdrawService) {}

  @Get('/newbie/account/withdraw/proof')
  @ApiOperation({
    summary:
      'Get proofs for withdraw to call `withdraw` contract method on client',
  })
  async getWithdrawProofs(
    @CurrentUser() user: EmailUser,
  ): Promise<GetWithdrawProofsResponse> {
    const res = await this.withdrawService.getWithdrawProofs(user.characterId);

    return res;
  }
}
