import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsEthereumAddress,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { CharacterMetadata } from 'crossbell';
import { TransactionResponse } from '../base/base.dto';

export class SetHandleBody {
  @IsString()
  @ApiProperty({ description: 'New handle' })
  @MaxLength(32)
  @Matches(/^[a-z0-9\-\_]+$/)
  handle!: string;
}

export class SetHandleResponse extends TransactionResponse {
  @ApiProperty({ description: 'Is set successfully' })
  data!: boolean;
}

export class SetMetadataBody {
  @ApiProperty({ description: 'Metadata', required: true })
  metadata!: CharacterMetadata;

  @ApiProperty({
    description:
      'Mode of behavior. `replace`: overwrite the old one; `merge`: deepmerge with the old one. Default: `merge`',
  })
  @IsEnum(['replace', 'merge'])
  @IsOptional()
  mode?: 'replace' | 'merge' = 'merge';
}

export class SetMetadataResponse extends TransactionResponse {
  @ApiProperty({ description: 'URI of the metadata' })
  data!: string;
}

export class AddOperatorBody {
  @ApiProperty({ description: 'Address of the operator' })
  @IsEthereumAddress()
  operator!: string;
}

export class AddOperatorResponse extends TransactionResponse {
  @ApiProperty({ description: 'Is added successfully' })
  data!: true;
}

export class RemoveOperatorParam {
  @ApiProperty({ description: 'Address of the operator' })
  @IsEthereumAddress()
  operator!: string;
}
