import { CrossbellContractService } from '@/module/contract/contract.service';
import { DynamicModule, Module } from '@nestjs/common';
import { CsbManagerService } from './csb-manager.service';
import { CsbManagerOptions, CSB_MANAGER_OPTIONS } from './csb-manager.type';

@Module({
  providers: [CsbManagerService, CrossbellContractService],
  exports: [CsbManagerService],
})
export class CsbManagerModule {
  static register(options?: CsbManagerOptions): DynamicModule {
    return {
      module: CsbManagerModule,
      providers: [
        {
          provide: CSB_MANAGER_OPTIONS,
          useValue: options,
        },
        CsbManagerService,
      ],
      exports: [CsbManagerService],
    };
  }
}
