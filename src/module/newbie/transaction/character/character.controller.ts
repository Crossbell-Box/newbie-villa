import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { NewbieCharacterService } from './character.service';
import {
  AddOperatorBody,
  AddOperatorResponse,
  RemoveOperatorParam,
  SetHandleBody,
  SetHandleResponse,
  SetMetadataBody,
  SetMetadataResponse,
} from './character.dto';
import {
  ApiBearerAuthNewbie,
  CurrentUser,
} from '../../newbie-jwt/newbie-jwt.decorator';
import { EmailUser } from '@prisma/client';
import { NewbieJwtAuthGuard } from '../../newbie-jwt/newbie-jwt.guard';

@Controller({
  path: '/',
  version: '1',
})
@ApiTags('Newbie')
@ApiBearerAuthNewbie()
@UseGuards(NewbieJwtAuthGuard)
export class NewbieCharacterController {
  constructor(private readonly characterService: NewbieCharacterService) {}

  // @Post('/newbie/contract/characters/me/handle')
  // @ApiOperation({ summary: 'Set a new handle for character' })
  // async setHandle(
  //   @CurrentUser() user: EmailUser,
  //   @Body() body: SetHandleBody,
  // ): Promise<SetHandleResponse> {
  //   const { handle } = body;

  //   const res = await this.characterService.setHandle(user.characterId, handle);

  //   return {
  //     data: res.data,
  //     transactionHash: res.transactionHash,
  //   };
  // }

  @Post('/newbie/contract/characters/me/metadata')
  @ApiOperation({ summary: 'Set metadata for character' })
  async setCharacterMetadata(
    @CurrentUser() user: EmailUser,
    @Body() body: SetMetadataBody,
  ): Promise<SetMetadataResponse> {
    const { metadata, mode } = body;

    const res =
      mode === 'replace'
        ? await this.characterService.setMetadata(user.characterId, metadata)
        : await this.characterService.changeMetadata(
            user.characterId,
            metadata,
          );

    return {
      data: res.data.uri,
      transactionHash: res.transactionHash,
    };
  }
}
