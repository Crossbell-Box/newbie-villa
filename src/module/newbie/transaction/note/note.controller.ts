import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
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
import {
  LockNoteResponse,
  NoteIdParam,
  PostNoteBody,
  PostNoteResponse,
  SetNoteMetadataBody,
  SetNoteMetadataResponse,
} from './note.dto';
import { NewbieNoteService } from './note.service';
import { WebException } from '@/utils/exception';

@Controller({
  path: '/',
  version: '1',
})
@ApiTags('Newbie')
@ApiBearerAuthNewbie()
@UseGuards(NewbieJwtAuthGuard)
export class NewbieNoteController {
  constructor(private readonly noteService: NewbieNoteService) {}

  @Put('/contract/notes')
  @ApiOperation({ summary: 'Post a new note' })
  async postNote(
    @CurrentUser() user: EmailUser,
    @Body() body: PostNoteBody,
  ): Promise<PostNoteResponse> {
    const { metadata, linkItemType, linkItem, locked } = body;

    if (!linkItemType) {
      const res = await this.noteService.postNote(user.characterId, metadata, {
        locked,
      });

      return {
        data: {
          noteId: Number(res.data.noteId),
        },
        transactionHash: res.transactionHash,
      };
    } else if (linkItemType === 'AnyUri') {
      const res = await this.noteService.postNoteForAnyUri(
        user.characterId,
        metadata,
        linkItem?.uri!,
        { locked },
      );

      return {
        data: {
          noteId: Number(res.data.noteId),
        },
        transactionHash: res.transactionHash,
      };
    } else if (linkItemType === 'Note') {
      const res = await this.noteService.postNoteForNote(
        user.characterId,
        metadata,
        linkItem?.characterId!,
        linkItem?.noteId!,
        { locked },
      );

      return {
        data: {
          noteId: Number(res.data.noteId),
        },
        transactionHash: res.transactionHash,
      };
    } else {
      // TODO: more link item types
      throw new WebException('Unsupported link item type');
    }
  }

  @Post('/contract/notes/:noteId/metadata')
  @ApiOperation({ summary: 'Set a new metadata for a note' })
  async setNoteMetadata(
    @CurrentUser() user: EmailUser,
    @Param() param: NoteIdParam,
    @Body() body: SetNoteMetadataBody,
  ): Promise<SetNoteMetadataResponse> {
    const { noteId } = param;
    const { metadata, mode } = body;

    const res =
      mode === 'replace'
        ? await this.noteService.setNoteMetadata(
            user.characterId,
            noteId,
            metadata,
          )
        : await this.noteService.changeNoteMetadata(
            user.characterId,
            noteId,
            metadata,
          );

    return {
      data: res.data,
      transactionHash: res.transactionHash,
    };
  }

  @Post('/contract/notes/:noteId/lock')
  @ApiOperation({ summary: 'Lock a note' })
  async lockNote(
    @CurrentUser() user: EmailUser,
    @Param() param: NoteIdParam,
  ): Promise<LockNoteResponse> {
    const { noteId } = param;

    const res = await this.noteService.lockNote(user.characterId, noteId);

    return {
      data: true,
      transactionHash: res.transactionHash,
    };
  }

  @Delete('/contract/notes/:noteId')
  @ApiOperation({ summary: 'Delete a note' })
  async deleteNote(
    @CurrentUser() user: EmailUser,
    @Param() param: NoteIdParam,
  ): Promise<LockNoteResponse> {
    const { noteId } = param;

    const res = await this.noteService.deleteNote(user.characterId, noteId);

    return {
      data: true,
      transactionHash: res.transactionHash,
    };
  }
}
