import { Injectable, Logger } from '@nestjs/common';
import { NewbieTransactionBaseService } from '../base/base.service';
import { deepMerge } from '../base/util';

@Injectable()
export class NewbieCharacterService extends NewbieTransactionBaseService {
  private readonly logger = new Logger(NewbieCharacterService.name);

  async setHandle(characterId: number, handle: string) {
    const res = await this.useContract(characterId, async (contract) => {
      return contract.character.setHandle(
        { characterId, handle },
        {
          nonce: await this.getNonce(),
        },
      );
    });

    return res;
  }

  async setMetadata(characterId: number, metadata: object) {
    const res = await this.useContract(characterId, async (contract) => {
      return contract.character.setMetadata(
        { characterId, metadata },
        {
          nonce: await this.getNonce(),
        },
      );
    });

    return res;
  }

  async changeMetadata(characterId: number, metadata: object) {
    const res = await this.useContract(characterId, async (contract) => {
      return contract.character.changeMetadata(
        {
          characterId,
          modifier: (oMetadata) => {
            if (oMetadata) {
              return deepMerge(oMetadata, metadata);
            }
            return metadata;
          },
        },
        {
          nonce: await this.getNonce(),
        },
      );
    });

    return res;
  }
}
