import { CrossbellContractModule } from '@/module/contract/contract.module';
import { CsbManagerModule } from '@/module/csb-manager/csb-manager.module';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../../prisma/prisma.module';
import { JWT_SECRET } from './newbie-jwt.constants';
import { NewbieJwtController } from './newbie-jwt.controller';
import { NewbieJwtService } from './newbie-jwt.service';
import { NewbieJwtStrategy } from './newbie-jwt.strategy';

@Module({
  imports: [
    PrismaModule,
    CrossbellContractModule,
    PassportModule,
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: '3650d' },
    }),
    CsbManagerModule.register({
      defaultCsb: '0.02',
    }),
  ],
  controllers: [NewbieJwtController],
  providers: [NewbieJwtService, NewbieJwtStrategy],
})
export class NewbieJwtModule {}
