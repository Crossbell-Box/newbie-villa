import { CrossbellContractService } from '@/module/contract/contract.service';
import { CsbManagerService } from '@/module/csb-manager/csb-manager.service';
import { PrismaService } from '@/module/prisma/prisma.service';
import { WebException } from '@/utils/exception';
import { InjectRedis } from '@songkeys/nestjs-redis';
import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { Contract, Result } from 'crossbell';
import { BigNumber } from 'ethers';
import Redis from 'ioredis';
import { setTimeout } from 'timers/promises';
import retry from 'async-retry';
import { publicClient } from '@/utils/public-client';
import { WatchEventParameters } from 'viem';
import { AbiEvent } from 'abitype';

@Injectable()
export class NewbieTransactionBaseService implements OnApplicationShutdown {
  readonly #logger = new Logger(NewbieTransactionBaseService.name);
  readonly #disposers = new Set<() => void>();

  protected contract = this.contractService.createContractV1('newbie-villa');

  constructor(
    protected readonly prisma: PrismaService,
    protected readonly csbManagerService: CsbManagerService,
    protected readonly contractService: CrossbellContractService,
    @InjectRedis() protected readonly redis: Redis, // used in sub classes
  ) {}

  protected async useContract<T extends Result<any, true>>(
    characterId: number,
    fn: (contract: Contract) => Promise<T>,
  ): Promise<T> {
    try {
      await this.checkCsb(characterId);
      const res = await retry(() => fn(this.contract), { retries: 3 });
      if (res.transactionHash) {
        await this.spendCsbForTx(characterId, res.transactionHash);
      }
      await setTimeout(1000); // wait to be indexed
      return res;
    } catch (err: any) {
      this.#logger.error(err);
      throw new WebException(err.message);
    }
  }

  async onApplicationShutdown() {
    this.#disposers.forEach((dispose) => dispose());
    this.#disposers.clear();
  }

  /**
   * @throws WebException if the user has no CSB
   */
  private async checkCsb(characterId: number): Promise<void> {
    const enough = await this.hasEnoughCsb(characterId);
    if (!enough) {
      throw new WebException(
        'You do not have enough $CSB to perform this action',
      );
    }
  }

  /**
   * @returns true if the user has enough CSB (> 0)
   */
  private async hasEnoughCsb(characterId: number): Promise<boolean> {
    const user = await this.prisma.emailUser.findUnique({
      where: { characterId },
      select: { csb: true },
    });
    if (!user) return false;
    const currentCsb = user.csb;
    return BigNumber.from(currentCsb).gt(0);
  }

  /**
   * @returns remaining CSB in wei string
   */
  private async spendCsbForTx(
    characterId: number,
    txHash: string,
  ): Promise<string> {
    const user = await this.prisma.emailUser.findUnique({
      where: { characterId },
      select: { csb: true },
    });
    if (!user) return '0';
    const currentCsb = user.csb ?? '0';
    const gas = await this.csbManagerService.getGasOfTx(txHash);
    let newCsb = this.csbManagerService.subtractCsb(currentCsb, gas);
    newCsb = BigNumber.from(newCsb).lt(0) ? '0' : newCsb;
    const updatedUser = await this.prisma.emailUser.update({
      where: { characterId },
      data: { csb: newCsb, updatedAt: new Date() },
      select: { csb: true },
    });
    return updatedUser.csb!;
  }

  async getNonce() {
    const newNonce = await this.contract.publicClient.getTransactionCount({
      address: this.contract.account.address,
      blockTag: 'pending',
    });
    return newNonce;
  }

  protected async getHistoryAndListen<
    const TAbiEvent extends AbiEvent,
    const TAbiEvents extends
      | readonly AbiEvent[]
      | readonly unknown[]
      | undefined = TAbiEvent extends AbiEvent ? [TAbiEvent] : undefined,
    TStrict extends boolean | undefined = undefined,
  >(params: WatchEventParameters<TAbiEvent, TAbiEvents, TStrict>) {
    const step = 10000000n;

    if (params.event?.name) {
      const eventName = params.event.name;
      const eventPoint = await this.prisma.contractEventPoint.findUnique({
        where: { name: eventName },
      });

      if (eventPoint) {
        this.#logger.debug(`Start retrieving logs for [${eventName}]`);

        let latestBlock = await publicClient.getBlockNumber();
        let fromBlock = BigInt(eventPoint.blockNumber) + 1n;
        let toBlock = fromBlock + step;

        while (toBlock < latestBlock) {
          this.#logger.debug(
            `Retrieve logs for [${eventName}] from [${fromBlock}] to [${toBlock}]`,
          );

          const logs = await publicClient.getLogs({
            address: params.address,
            event: params.event,
            fromBlock,
            toBlock,
          });

          if (logs.length > 0) {
            this.#logger.debug(
              `Found [${logs.length}] log(s) for [${eventName}]`,
            );
            await params.onLogs(logs as any);
          }

          await this.prisma.contractEventPoint.update({
            where: { name: eventName },
            data: { blockNumber: toBlock },
          });

          fromBlock = toBlock + 1n;
          toBlock = fromBlock + step;
          latestBlock = await publicClient.getBlockNumber();
        }

        this.#logger.debug(`Finish retrieving logs for [${eventName}]`);
      } else {
        const latestBlockNumber = await publicClient.getBlockNumber();

        this.#logger.debug(
          `No existing event point for [${eventName}]. Create a new one starting at [${latestBlockNumber}].`,
        );

        await this.prisma.contractEventPoint.create({
          data: { name: params.event.name, blockNumber: latestBlockNumber },
        });
      }
    }

    this.#logger.debug(`Start watching the [${params.event?.name}] event.`);

    const unwatch = publicClient.watchEvent({
      ...(params as any),
      onLogs: (async (logs) => {
        this.#logger.debug(
          `Receive ${logs.length} log(s) for [${
            params.event?.name ?? 'unknown'
          }] event`,
        );

        await params.onLogs(logs);

        const lastBlockNumber = findLastBlockNumber(logs);

        if (params.event?.name && lastBlockNumber !== null) {
          await this.prisma.contractEventPoint.update({
            where: { name: params.event.name },
            data: { blockNumber: lastBlockNumber },
          });
        }
      }) satisfies typeof params.onLogs,
    });

    const disposer = () => {
      this.#logger.debug(`Stop watching the [${params.event?.name}] event.`);
      unwatch();
      this.#disposers.delete(disposer);
    };

    this.#disposers.add(disposer);

    return disposer;
  }
}

function findLastBlockNumber(logs: { blockNumber: bigint }[]): bigint | null {
  return logs.reduce(
    (max, curr) => {
      if (max === null) {
        return curr.blockNumber;
      } else {
        return curr.blockNumber > max ? curr.blockNumber : max;
      }
    },
    null as null | bigint,
  );
}
