import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { toBytes, keccak256, encodePacked } from 'viem';
import { Abi } from 'crossbell';

import { getAbiEvent } from '@/utils/get-abi-event';
import { getDateOfBlock } from '@/utils/get-date-of-block';

import { NEWBIE_VILLA_CONTRACT_ADDRESS } from '../../newbie.constants';
import { NewbieTransactionBaseService } from '../base/base.service';

@Injectable()
export class NewbieWithdrawService
  extends NewbieTransactionBaseService
  implements OnModuleInit, OnApplicationShutdown
{
  private readonly logger = new Logger(NewbieWithdrawService.name);

  async onModuleInit() {
    this.logger.debug('onModuleInit: start to watch contract events');
    this.startWatch();
  }

  async onApplicationShutdown() {
    this.logger.debug('onApplicationShutdown: unwatch contract events');
    await super.onApplicationShutdown();
  }

  /**
   * Withdraw a character to a new address from the newbie villa.
   * @see https://www.notion.so/rss3/Product-Requirements-Document-008cdc05cfaf4fee8c5bbdf61281eb3c?p=5d5a583738a744b185cc8db42ed34758&pm=s
   **/
  async getWithdrawProofs(characterId: number) {
    // nonce is a random number from 0 to 1000000
    const nonce = Math.floor(Math.random() * 1000000);
    // expires is a timestamp in milliseconds, which is 10 minutes later than the current time
    const expires = Date.now() + 10 * 60 * 1000;

    const digest = toBytes(
      keccak256(
        encodePacked(
          ['address', 'uint256', 'uint256', 'uint256'],
          [
            NEWBIE_VILLA_CONTRACT_ADDRESS,
            BigInt(characterId),
            BigInt(nonce),
            BigInt(expires),
          ],
        ),
      ),
    );

    const proof = await this.contract.walletClient!.signMessage({
      message: { raw: digest },
    });

    return {
      nonce,
      expires,
      proof,
    };
  }

  private startWatch() {
    const withdraw = getAbiEvent(Abi.newbieVilla, 'Withdraw');

    this.getHistoryAndListen({
      event: withdraw,
      onLogs: async (logs) => {
        for (const log of logs) {
          const toAddress = log.args.to;
          const characterId = log.args.characterId;

          if (toAddress && characterId) {
            const user = await this.prisma.emailUser.findUnique({
              where: { characterId: Number(characterId) },
            });

            if (user && user.characterWithdrawnAt === null) {
              try {
                this.logger.verbose(
                  `Withdraw character [${characterId}] to [${toAddress}]`,
                );

                const date = await getDateOfBlock(log.blockNumber);

                await this.prisma.emailUser.update({
                  data: {
                    updatedAt: date,
                    characterWithdrawnAt: date,
                    characterWithdrawnTo: toAddress,
                  },
                  where: { characterId: Number(characterId) },
                });
              } catch (err) {
                this.logger.error(err);
              }
            }
          }
        }
      },
    });
  }
}
