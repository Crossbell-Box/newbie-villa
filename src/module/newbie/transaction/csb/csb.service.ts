import { WebException } from '@/utils/exception';
import { Injectable, Logger } from '@nestjs/common';
import { BigNumber } from 'ethers';
import { NewbieTransactionBaseService } from '../base/base.service';

@Injectable()
export class NewbieCsbService extends NewbieTransactionBaseService {
  private readonly logger = new Logger(NewbieCsbService.name);

  /**
   * @returns remaining balance in wei
   */
  async getCurrentCsb(characterId: number): Promise<string | null> {
    const user = await this.prisma.emailUser.findUnique({
      where: { characterId },
      select: { csb: true },
    });

    if (!user) {
      return null;
    }

    return user.csb;
  }

  /**
   * @returns remaining balance in wei
   */
  async refillCsb(characterId: number): Promise<string> {
    // only can refill csb once per day
    const cacheKey = `newbie:csb:refill:${characterId}`;

    const hasRefilled = await this.redis.get(cacheKey);
    if (hasRefilled) {
      throw new WebException('You have already refilled $CSB today');
    }

    const defaultCsb = this.csbManagerService.getDefaultCsb();

    // update record
    await this.prisma.$transaction(async (tx) => {
      const user = await tx.emailUser.findUnique({
        where: { characterId },
        select: { csb: true },
      });

      if (!user) {
        return;
      }

      const newCsb = BigNumber.from(defaultCsb).add(user.csb!).toString();

      await tx.emailUser.update({
        where: { characterId },
        data: {
          csb: newCsb,
          updatedAt: new Date(),
        },
        select: { csb: true },
      });
    });

    // mark time
    await this.redis.setex(cacheKey, 86400, '1');

    return defaultCsb;
  }
}
