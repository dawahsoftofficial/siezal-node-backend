import { Global, Module } from '@nestjs/common';

import { AesHelper } from './aes.helper';
import { GuardHelper } from './guard.helper';
import { UserSessionModule } from 'src/module/user-session/user-session.module';

@Global()
@Module({
  imports: [UserSessionModule],
  providers: [AesHelper, GuardHelper],
  exports: [AesHelper, GuardHelper],
})
export class HelperModule {}
