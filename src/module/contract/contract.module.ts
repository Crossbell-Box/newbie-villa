import { Module } from '@nestjs/common';
import { CrossbellContractService } from './contract.service';

@Module({
  providers: [CrossbellContractService],
  exports: [CrossbellContractService],
})
export class CrossbellContractModule {}
