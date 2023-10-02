import {
  Body,
  Controller,
  Delete,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiBearerAuthNewbie,
  CurrentUser,
} from '../../newbie-jwt/newbie-jwt.decorator';
import { EmailUser } from '@prisma/client';
import { NewbieJwtAuthGuard } from '../../newbie-jwt/newbie-jwt.guard';
import { NewbieLinkService } from './link.service';
import {
  LinkCharacterBody,
  LinkCharacterParam,
  LinkCharacterResponse,
  LinkCharactersInBatchBody,
  LinkNoteBody,
  LinkNoteParam,
  LinkNoteResponse,
  UnlinkCharacterParam,
  UnlinkCharacterResponse,
  UnlinkNoteParam,
  UnlinkNoteResponse,
} from './link.dto';
import { WebException } from '@/utils/exception';
import { isAddress } from 'ethers/lib/utils';

@Controller({
  path: '/',
  version: '1',
})
@ApiTags('Newbie')
@ApiBearerAuthNewbie()
@UseGuards(NewbieJwtAuthGuard)
export class NewbieLinkController {
  constructor(private readonly linkService: NewbieLinkService) {}

  @Put('/contract/links/characters/:toCharacterIdOrToAddress/:linkType')
  @ApiOperation({ summary: 'Link a character' })
  async linkCharacter(
    @CurrentUser() user: EmailUser,
    @Param() param: LinkCharacterParam,
    @Body() body: LinkCharacterBody,
  ): Promise<LinkCharacterResponse> {
    const { toCharacterIdOrToAddress, linkType } = param;
    const { data } = body;

    const isToAddress = isAddress(toCharacterIdOrToAddress.toString());

    if (!isToAddress) {
      const res = await this.linkService.linkCharacter(
        user.characterId,
        Number(toCharacterIdOrToAddress),
        linkType,
        data,
      );

      return {
        data: { linklistId: Number(res.data) },
        transactionHash: res.transactionHash,
      };
    } else if (isToAddress) {
      const res = await this.linkService.createThenLinkCharacter(
        user.characterId,
        toCharacterIdOrToAddress.toString() as `0x${string}`,
        linkType,
      );

      return {
        data: {
          linklistId: Number(res.data.linklistId),
          toCharacterId: Number(res.data.toCharacterId),
        },
        transactionHash: res.transactionHash,
      };
    } else {
      throw new WebException(
        'Invalid toCharacterIdOrToAddress. Should be number or string.',
      );
    }
  }

  @Put('/contract/links/characters')
  @ApiOperation({ summary: 'Link characters in batch' })
  async linkCharactersInBatch(
    @CurrentUser() user: EmailUser,
    @Body() body: LinkCharactersInBatchBody,
  ): Promise<LinkCharacterResponse> {
    const { toCharacterIds, toAddresses, linkType, data } = body;

    const res = await this.linkService.linkCharactersInBatch(
      user.characterId,
      toCharacterIds,
      toAddresses,
      linkType,
      data,
    );

    return {
      data: { linklistId: Number(res.data) },
      transactionHash: res.transactionHash,
    };
  }

  @Delete('/contract/links/characters/:toCharacterId/:linkType')
  @ApiOperation({ summary: 'Unlink a character' })
  async unlinkCharacter(
    @CurrentUser() user: EmailUser,
    @Param() param: UnlinkCharacterParam,
  ): Promise<UnlinkCharacterResponse> {
    const { toCharacterId, linkType } = param;

    const res = await this.linkService.unlinkCharacter(
      user.characterId,
      toCharacterId,
      linkType,
    );

    return {
      data: true,
      transactionHash: res.transactionHash,
    };
  }

  @Put('/contract/links/notes/:toCharacterId/:toNoteId/:linkType')
  @ApiOperation({ summary: 'Link a note' })
  async linkNote(
    @CurrentUser() user: EmailUser,
    @Param() param: LinkNoteParam,
    @Body() body: LinkNoteBody,
  ): Promise<LinkNoteResponse> {
    const { toCharacterId, toNoteId, linkType } = param;
    const { data } = body;

    const res = await this.linkService.linkNote(
      user.characterId,
      toCharacterId,
      toNoteId,
      linkType,
      data,
    );

    return {
      data: { linklistId: Number(res.data) },
      transactionHash: res.transactionHash,
    };
  }

  @Delete('/contract/links/notes/:toCharacterId/:toNoteId/:linkType')
  @ApiOperation({ summary: 'Unlink a note' })
  async unlinkNote(
    @CurrentUser() user: EmailUser,
    @Param() param: UnlinkNoteParam,
  ): Promise<UnlinkNoteResponse> {
    const { toCharacterId, toNoteId, linkType } = param;

    const res = await this.linkService.unlinkNote(
      user.characterId,
      toCharacterId,
      toNoteId,
      linkType,
    );

    return {
      data: true,
      transactionHash: res.transactionHash,
    };
  }
}
