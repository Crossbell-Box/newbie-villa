import { Module } from '@nestjs/common';
import { NewbieJwtModule } from './newbie-jwt/newbie-jwt.module';
import { NewbieTransactionModule } from './transaction/transaction.module';

@Module({
  imports: [NewbieJwtModule, NewbieTransactionModule],
})
export class NewbieModule {}
