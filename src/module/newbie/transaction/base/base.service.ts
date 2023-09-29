import { CrossbellContractService } from '@/module/contract/contract.service';
import { CsbManagerService } from '@/module/csb-manager/csb-manager.service';
import { PrismaService } from '@/module/prisma/prisma.service';
import { WebException } from '@/utils/exception';
import { InjectRedis } from '@songkeys/nestjs-redis';
import { Injectable, Logger } from '@nestjs/common';
import { Contract, Result } from 'crossbell';
import { BigNumber } from 'ethers';
import Redis from 'ioredis';
import { setTimeout } from 'timers/promises';
import retry from 'async-retry';

@Injectable()
export class NewbieTransactionBaseService {
  private readonly internalLogger = new Logger(
    NewbieTransactionBaseService.name,
  );
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
      this.internalLogger.error(err);
      throw new WebException(err.message);
    }
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
}
