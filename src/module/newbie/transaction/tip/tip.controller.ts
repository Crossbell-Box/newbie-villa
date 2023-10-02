import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { NewbieTipService } from './tip.service';
import {
  ApiBearerAuthNewbie,
  CurrentUser,
} from '../../newbie-jwt/newbie-jwt.decorator';
import { EmailUser } from '@prisma/client';
import { NewbieJwtAuthGuard } from '../../newbie-jwt/newbie-jwt.guard';
import { TipBody, TipResponse } from './tip.dto';

@Controller({
  path: '/',
  version: '1',
})
@ApiTags('Newbie')
@ApiBearerAuthNewbie()
@UseGuards(NewbieJwtAuthGuard)
export class NewbieTipController {
  constructor(private readonly tipService: NewbieTipService) {}

  @Post('/contract/tips')
  @ApiOperation({
    summary: "Send a tip to a character (and for this character's note)",
  })
  async setHandle(
    @CurrentUser() user: EmailUser,
    @Body() body: TipBody,
  ): Promise<TipResponse> {
    const { characterId: fromCharacterId } = user;
    const { characterId: toCharacterId, noteId: toNoteId, amount } = body;

    const res = toNoteId
      ? await this.tipService.tipCharacterForNote(
          fromCharacterId,
          toCharacterId,
          toNoteId,
          amount,
        )
      : await this.tipService.tipCharacter(
          fromCharacterId,
          toCharacterId,
          amount,
        );

    return {
      data: true,
      transactionHash: res.transactionHash,
    };
  }
}
