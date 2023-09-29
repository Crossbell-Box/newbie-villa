import { ApiProperty } from '@nestjs/swagger';

export class GetWithdrawProofsResponse {
  @ApiProperty({ description: 'Nonce' })
  nonce!: number;

  @ApiProperty({ description: 'Expires by this timestamp' })
  expires!: number;

  @ApiProperty({ description: 'Proof' })
  proof!: string;
}
