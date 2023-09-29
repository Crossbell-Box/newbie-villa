import { CrossbellContractModule } from '@/module/contract/contract.module';
import { CsbManagerModule } from '@/module/csb-manager/csb-manager.module';
import { PrismaModule } from '@/module/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { NewbieJwtModule } from '../newbie-jwt/newbie-jwt.module';
import { NewbieCharacterController } from './character/character.controller';
import { NewbieCharacterService } from './character/character.service';
import { NewbieCsbController } from './csb/csb.controller';
import { NewbieCsbService } from './csb/csb.service';
import { NewbieLinkController } from './link/link.controller';
import { NewbieLinkService } from './link/link.service';
import { NewbieNoteController } from './note/note.controller';
import { NewbieNoteService } from './note/note.service';
import { NewbieTipController } from './tip/tip.controller';
import { NewbieTipService } from './tip/tip.service';
import { NewbieWithdrawController } from './withdraw/withdraw.controller';
import { NewbieWithdrawService } from './withdraw/withdraw.service';

@Module({
  imports: [
    NewbieJwtModule,
    CsbManagerModule.register({
      defaultCsb: '0.02',
    }),
    CrossbellContractModule,
    PrismaModule,
  ],
  controllers: [
    NewbieCharacterController,
    NewbieLinkController,
    NewbieNoteController,
    NewbieWithdrawController,
    NewbieCsbController,
    NewbieTipController,
  ],
  providers: [
    NewbieCharacterService,
    NewbieLinkService,
    NewbieNoteService,
    NewbieWithdrawService,
    NewbieCsbService,
    NewbieTipService,
  ],
})
export class NewbieTransactionModule {}
