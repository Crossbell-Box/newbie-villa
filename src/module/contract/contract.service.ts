import { Injectable, Logger } from '@nestjs/common';
import { createContract, Contract } from 'crossbell';
import { setJsonRpcAddress } from 'crossbell/network';
import assert from 'assert';
import { isAddress } from 'viem';

export type ContractType = 'readonly' | 'newbie-villa';

@Injectable()
export class CrossbellContractService {
  protected readonly logger = new Logger('CrossbellContractService');

  private contracts = new Map<ContractType, Contract>();

  createContractV1(type: ContractType) {
    setJsonRpcAddress(process.env.RPC_ENDPOINT_HTTP!);

    const cached = this.contracts.get(type);

    if (cached) {
      return cached;
    } else {
      const contract = createContract(this.getPrivateKey(type), {
        address: { cbtContract: '0x3D1b588a6Bcd728Bb61570ced6656eA4C05e404f' },
      });

      this.logger.debug(`Create contract for ${type}`);
      this.contracts.set(type, contract);

      return contract;
    }
  }

  private getPrivateKey(type: ContractType) {
    switch (type) {
      case 'readonly': {
        return undefined;
      }

      case 'newbie-villa': {
        const privateKey = process.env
          .NEWBIE_VILLA_CONTRACT_PRIVATE_KEY as `0x${string}`;

        assert(
          privateKey,
          'NEWBIE_VILLA_CONTRACT_PRIVATE_KEY is missing from environment variables',
        );

        assert(
          privateKey.startsWith('0x'),
          `Invalid NEWBIE_VILLA_CONTRACT_PRIVATE_KEY format. Please ensure you prepend '0x' to the beginning of your key`,
        );

        return privateKey;
      }
    }
  }
}
