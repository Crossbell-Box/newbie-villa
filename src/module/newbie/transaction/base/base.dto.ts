import { ApiProperty } from '@nestjs/swagger';

export class TransactionResponse<T = any> {
  @ApiProperty({ description: 'Transaction hash' })
  transactionHash!: string;

  data?: T;
}
