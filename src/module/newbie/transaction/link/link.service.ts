import { Injectable, Logger } from '@nestjs/common';
import { NewbieTransactionBaseService } from '../base/base.service';

@Injectable()
export class NewbieLinkService extends NewbieTransactionBaseService {
  private readonly logger = new Logger(NewbieLinkService.name);

  async linkCharacter(
    fromCharacterId: number,
    toCharacterId: number,
    linkType: string,
    data?: `0x${string}`,
  ) {
    const res = await this.useContract(fromCharacterId, async (contract) => {
      return contract.link.linkCharacter(
        { fromCharacterId, toCharacterId, linkType, data },
        { nonce: await this.getNonce() },
      );
    });

    return res;
  }

  async linkCharactersInBatch(
    fromCharacterId: number,
    toCharacterIds: number[],
    toAddresses: `0x${string}`[],
    linkType: string,
    data?: `0x${string}`[],
  ) {
    const res = await this.useContract(fromCharacterId, async (contract) => {
      return contract.link.linkCharactersInBatch(
        { fromCharacterId, toCharacterIds, toAddresses, linkType, data },
        { nonce: await this.getNonce() },
      );
    });

    return res;
  }

  async createThenLinkCharacter(
    fromCharacterId: number,
    toAddress: `0x${string}`,
    linkType: string,
  ) {
    const res = await this.useContract(fromCharacterId, async (contract) => {
      return contract.link.createThenLinkCharacter(
        { fromCharacterId, toAddress, linkType },
        { nonce: await this.getNonce() },
      );
    });

    return res;
  }

  async unlinkCharacter(
    fromCharacterId: number,
    toCharacterId: number,
    linkType: string,
  ) {
    const res = await this.useContract(fromCharacterId, async (contract) => {
      return contract.link.unlinkCharacter(
        { fromCharacterId, toCharacterId, linkType },
        { nonce: await this.getNonce() },
      );
    });

    return res;
  }

  async linkNote(
    fromCharacterId: number,
    toCharacterId: number,
    toNoteId: number,
    linkType: string,
    data?: `0x${string}`,
  ) {
    const res = await this.useContract(fromCharacterId, async (contract) => {
      return contract.link.linkNote(
        { fromCharacterId, toCharacterId, toNoteId, linkType, data },
        { nonce: await this.getNonce() },
      );
    });

    return res;
  }

  async unlinkNote(
    fromCharacterId: number,
    toCharacterId: number,
    toNoteId: number,
    linkType: string,
  ) {
    const res = await this.useContract(fromCharacterId, async (contract) => {
      return contract.link.unlinkNote(
        { fromCharacterId, toCharacterId, toNoteId, linkType },
        { nonce: await this.getNonce() },
      );
    });

    return res;
  }
}
