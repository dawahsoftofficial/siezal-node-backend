import { Global, Module } from '@nestjs/common';

import { AesHelper } from './aes.helper';
import { GuardHelper } from './guard.helper';
@Global()
@Module({
  providers: [AesHelper,GuardHelper],
  exports: [AesHelper,  GuardHelper],
})
export class HelperModule {}
