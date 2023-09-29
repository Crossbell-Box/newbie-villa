import { Injectable, Logger } from '@nestjs/common';
import { NoteMetadata } from 'crossbell';
import { NewbieTransactionBaseService } from '../base/base.service';
import { deepMerge } from '../base/util';

@Injectable()
export class NewbieNoteService extends NewbieTransactionBaseService {
  private readonly logger = new Logger(NewbieNoteService.name);

  async postNote(
    fromCharacterId: number,
    metadata: NoteMetadata,
    { locked }: { locked?: boolean } = {},
  ) {
    const res = await this.useContract(fromCharacterId, async (contract) => {
      return contract.note.post(
        { characterId: fromCharacterId, metadataOrUri: metadata, locked },
        { nonce: await this.getNonce() },
      );
    });

    return res;
  }

  async postNoteForNote(
    fromCharacterId: number,
    metadata: NoteMetadata,
    toCharacterId: number,
    toNoteId: number,
    { locked }: { locked?: boolean } = {},
  ) {
    const res = await this.useContract(fromCharacterId, async (contract) => {
      return contract.note.postForNote(
        {
          characterId: fromCharacterId,
          metadataOrUri: metadata,
          targetCharacterId: toCharacterId,
          targetNoteId: toNoteId,
          locked,
        },
        { nonce: await this.getNonce() },
      );
    });

    return res;
  }

  async postNoteForAnyUri(
    fromCharacterId: number,
    metadata: NoteMetadata,
    toUri: string,
    { locked }: { locked?: boolean } = {},
  ) {
    const res = await this.useContract(fromCharacterId, async (contract) => {
      return contract.note.postForAnyUri(
        {
          characterId: fromCharacterId,
          metadataOrUri: metadata,
          targetUri: toUri,
          locked,
        },
        { nonce: await this.getNonce() },
      );
    });

    return res;
  }

  async setNoteMetadata(
    characterId: number,
    noteId: number,
    metadata: NoteMetadata,
  ) {
    const res = await this.useContract(characterId, async (contract) => {
      return contract.note.setMetadata(
        { characterId, noteId, metadata },
        { nonce: await this.getNonce() },
      );
    });

    return res;
  }

  async changeNoteMetadata(
    characterId: number,
    noteId: number,
    metadata: NoteMetadata,
  ) {
    const res = await this.useContract(characterId, async (contract) => {
      return contract.note.changeMetadata(
        {
          characterId,
          noteId,
          modifier: (oMetadata) => {
            if (oMetadata) {
              return deepMerge(oMetadata, metadata);
            }
            return metadata;
          },
        },
        { nonce: await this.getNonce() },
      );
    });

    return res;
  }

  async lockNote(characterId: number, noteId: number) {
    const res = await this.useContract(characterId, async (contract) => {
      return contract.note.lock(
        { characterId, noteId },
        { nonce: await this.getNonce() },
      );
    });

    return res;
  }

  async deleteNote(characterId: number, noteId: number) {
    const res = await this.useContract(characterId, async (contract) => {
      return contract.note.delete(
        { characterId, noteId },
        { nonce: await this.getNonce() },
      );
    });

    return res;
  }
}
