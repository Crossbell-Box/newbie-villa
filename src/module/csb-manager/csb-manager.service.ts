import { Inject, Injectable, Logger } from '@nestjs/common';
import { BigNumber, ethers } from 'ethers';
import { CrossbellContractService } from '@/module/contract/contract.service';
import { CsbManagerOptions, CSB_MANAGER_OPTIONS } from './csb-manager.type';
import retry from 'async-retry';

@Injectable()
export class CsbManagerService {
  private readonly logger = new Logger(CsbManagerService.name);

  private options: CsbManagerOptions;

  constructor(
    @Inject(CSB_MANAGER_OPTIONS) private _options: Partial<CsbManagerOptions>,
    private readonly contractService: CrossbellContractService,
  ) {
    this.options = {
      defaultCsb: '0.02',
      ...this._options,
    };
  }

  private contract = this.contractService.createContractV1('readonly');

  get publicClient() {
    return this.contract.publicClient;
  }

  /**
   * @returns 0.02 CSB in gwei string
   */
  getDefaultCsb(): string {
    return ethers.utils.parseUnits(this.options.defaultCsb, 'ether').toString();
  }

  /**
   * In gwei
   */
  async getGasOfTx(txHash: string): Promise<string> {
    return await retry(
      async () => {
        const [gasPrice, txReceipt] = await Promise.all([
          this.publicClient.getGasPrice(),
          this.publicClient.getTransactionReceipt({
            hash: txHash as `0x${string}`,
          }),
        ]);
        return (txReceipt.gasUsed * gasPrice).toString();
      },
      { retries: 5 },
    );
  }

  /**
   * In gwei
   */
  subtractCsb(csb: string, amount: string): string {
    return BigNumber.from(csb).sub(BigNumber.from(amount)).toString();
  }

  /**
   * In gwei
   */
  addCsb(csb: string, amount: string): string {
    return BigNumber.from(csb).add(BigNumber.from(amount)).toString();
  }
}
