import { ApiProperty } from '@nestjs/swagger';
import {
  IsEthereumAddress,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { TransactionResponse } from '../base/base.dto';

export class LinkCharacterParam {
  @ApiProperty({
    description:
      'Target character ID Or address string if the target character is not created yet',
  })
  toCharacterIdOrToAddress!: number | string;

  @ApiProperty({ description: 'Link type', example: 'follow' })
  @IsString()
  linkType!: string;
}

export class LinkCharacterBody {
  @ApiProperty({
    description:
      'The data to be passed to the link module if the character has one.',
  })
  @IsOptional()
  data?: `0x${string}`;
}

class LinkCharacterResponseData {
  @ApiProperty({ description: 'Linklist ID' })
  linklistId!: number;

  @ApiProperty({
    description:
      'Target character ID (only available when linking a new character with address)',
  })
  toCharacterId?: number;
}
export class LinkCharacterResponse extends TransactionResponse {
  data!: LinkCharacterResponseData;
}

export class LinkCharactersInBatchBody {
  @ApiProperty({ description: 'Target character IDs' })
  @IsInt({ each: true })
  toCharacterIds!: number[];

  @ApiProperty({ description: 'Target addresses' })
  @IsString({ each: true })
  toAddresses!: `0x${string}`[];

  @ApiProperty({ description: 'Link type', example: 'follow' })
  @IsString()
  linkType!: string;

  @ApiProperty({
    description:
      'The data to be passed to the link module if the character has one.',
  })
  @IsOptional()
  data?: `0x${string}`[];
}

export class UnlinkCharacterParam {
  @ApiProperty({ description: 'Target character ID' })
  @IsInt()
  toCharacterId!: number;

  @ApiProperty({ description: 'Link type', example: 'follow' })
  @IsString()
  linkType!: string;
}

export class UnlinkCharacterResponse extends TransactionResponse {
  data!: boolean;
}

export class LinkNoteParam {
  @ApiProperty({ description: 'Target character ID' })
  @IsInt()
  toCharacterId!: number;

  @ApiProperty({ description: 'Target note ID' })
  @IsInt()
  toNoteId!: number;

  @ApiProperty({ description: 'Link type', example: 'like' })
  @IsString()
  linkType!: string;
}

export class LinkNoteBody {
  @ApiProperty({
    description:
      'The data to be passed to the link module if the note has one.',
  })
  @IsOptional()
  data?: `0x${string}`;
}

class LinkNoteResponseData {
  @ApiProperty({ description: 'Linklist ID' })
  linklistId!: number;
}
export class LinkNoteResponse extends TransactionResponse {
  data!: LinkNoteResponseData;
}

export class UnlinkNoteParam {
  @ApiProperty({ description: 'Target character ID' })
  @IsInt()
  toCharacterId!: number;

  @ApiProperty({ description: 'Target note ID' })
  @IsInt()
  toNoteId!: number;

  @ApiProperty({ description: 'Link type', example: 'like' })
  @IsString()
  linkType!: string;
}

export class UnlinkNoteResponse extends TransactionResponse {
  data!: boolean;
}
