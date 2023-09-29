import { ApiProperty } from '@nestjs/swagger';

export class GetCsbBalanceResponse {
  @ApiProperty({ description: 'CSB balance in wei' })
  balance!: string | null;
}
