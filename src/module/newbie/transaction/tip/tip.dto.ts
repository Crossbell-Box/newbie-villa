import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { TransactionResponse } from '../base/base.dto';

export class TipBody {
  @ApiProperty({
    description: 'Character ID to tip',
    required: true,
  })
  @IsInt()
  characterId!: number;

  @ApiProperty({
    description: 'Note ID to tip',
    required: false,
  })
  @IsOptional()
  @IsInt()
  noteId?: number;

  @ApiProperty({
    description: 'Amount to tip in wei, in string format',
    required: true,
  })
  @IsString()
  amount!: string;
}

export class TipResponse extends TransactionResponse {
  @ApiProperty({ description: 'Is successfully' })
  data!: boolean;
}
