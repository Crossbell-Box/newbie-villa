import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { LinkItemType, NoteMetadata } from 'crossbell.js';
import { TransactionResponse } from '../base/base.dto';

class NoteLinkItem {
  characterId?: number;
  noteId?: number;
  address?: string;
  contractAddress?: string;
  tokenId?: string;
  linklistId?: number;
  uri?: string;
}

export class PostNoteBody {
  @ApiProperty({ description: 'Metadata', required: true })
  metadata!: NoteMetadata;

  @ApiProperty({ description: 'Lock the note', required: false })
  @IsOptional()
  locked?: boolean;

  @ApiProperty({
    description: 'Link item type',
    required: false,
    enum: ['Character', 'Address', 'Note', 'ERC721', 'Linklist', 'AnyUri'],
  })
  @IsEnum(['Character', 'Address', 'Note', 'ERC721', 'Linklist', 'AnyUri'])
  @IsOptional()
  linkItemType?: LinkItemType;

  @ApiProperty({ description: 'Link to other notes', required: false })
  @IsOptional()
  linkItem?: NoteLinkItem;
}

class PostNoteResponseData {
  @ApiProperty({ description: 'Note ID' })
  noteId!: number;
}
export class PostNoteResponse extends TransactionResponse {
  data?: PostNoteResponseData;
}

export class SetNoteMetadataBody {
  @ApiProperty({ description: 'Metadata' })
  metadata!: NoteMetadata;

  @ApiProperty({
    description:
      'Mode of behavior. `replace`: overwrite the old one; `merge`: deepmerge with the old one. Default: `merge`',
  })
  @IsEnum(['replace', 'merge'])
  @IsOptional()
  mode?: 'replace' | 'merge' = 'merge';
}

class SetNoteMetadataResponseData {
  @ApiProperty({ description: 'URI of metadata' })
  uri!: string;

  @ApiProperty({ description: 'Metadata' })
  metadata!: NoteMetadata;
}
export class SetNoteMetadataResponse extends TransactionResponse {
  data!: SetNoteMetadataResponseData;
}

export class NoteIdParam {
  @ApiProperty({ description: 'Note ID' })
  @IsInt()
  noteId!: number;
}

export class LockNoteResponse extends TransactionResponse {
  data!: boolean;
}

export class DeleteNoteResponse extends TransactionResponse {
  data!: boolean;
}
