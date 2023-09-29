import { Injectable, Logger } from '@nestjs/common';
import { NewbieTransactionBaseService } from '../base/base.service';

@Injectable()
export class NewbieTipService extends NewbieTransactionBaseService {
  private readonly logger = new Logger(NewbieTipService.name);

  async tipCharacter(
    fromCharacterId: number,
    toCharacterId: number,
    amount: string,
  ) {
    const res = await this.useContract(fromCharacterId, async (contract) => {
      return contract.tips.tipCharacterFromNewbieVilla(
        { fromCharacterId, toCharacterId, amount },
        { nonce: await this.getNonce() },
      );
    });

    return res;
  }

  async tipCharacterForNote(
    fromCharacterId: number,
    toCharacterId: number,
    toNoteId: number,
    amount: string,
  ) {
    const res = await this.useContract(fromCharacterId, async (contract) => {
      // TODO: the function arguments is not correct
      return contract.tips.tipCharacterForNoteFromNewbieVilla(
        fromCharacterId,
        toCharacterId,
        toNoteId,
        amount,
        { nonce: await this.getNonce() },
      );
    });

    return res;
  }
}
